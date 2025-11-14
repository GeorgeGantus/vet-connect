const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db/db-config');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { Storage } = require('@google-cloud/storage');

const router = express.Router();

// --- Google Cloud Storage Configuration ---
// Initialize GCS Storage. It will automatically use credentials
// from the environment (GOOGLE_APPLICATION_CREDENTIALS)
const gcs = new Storage({
  // If you are running locally, you may need to specify the project ID and key file.
  // On GCP, this is often not needed.
  // projectId: process.env.GCP_PROJECT_ID,
  // keyFilename: process.env.GCS_KEYFILE,
});

// The GCS bucket to which we're uploading files.
// It's best practice to store this in an environment variable.
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'your-gcs-bucket-name';
const bucket = gcs.bucket(BUCKET_NAME);

// --- Multer Configuration ---
// We will use memory storage to process the file as a buffer in memory,
// then upload it directly to GCS. This avoids writing to disk and is more efficient.
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const VENDOR_ONLY = [authenticate, authorize(['vendor'])];
const VET_ONLY = [authenticate, authorize(['veterinarian'])];

// --- 1. Add a new Product (Vendors only) ---
// POST /api/products
router.post('/', VENDOR_ONLY, upload.single('image'), async (req, res) => {
  const { name, description, catalog_id } = req.body;

  if (!name || !catalog_id) {
    return res.status(400).json({ message: 'Product name and catalog_id are required.' });
  }

  try {
    // Ownership Check: Ensure the vendor owns the catalog
    const catalog = await db('catalogs').where({ id: catalog_id }).first();
    if (!catalog) {
      return res.status(404).json({ message: `Catalog with id ${catalog_id} not found.` });
    }
    if (catalog.vendor_id !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this catalog.' });
    }

    let image_url = null;

    // If a file is uploaded, handle the GCS upload
    if (req.file) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const blobName = `products/${req.file.fieldname}-${uniqueSuffix}${path.extname(req.file.originalname)}`;
      const blob = bucket.file(blobName);

      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      blobStream.on('error', err => res.status(500).json({ message: 'Could not upload image to GCS.', error: err }));

      blobStream.on('finish', async () => {
        image_url = `https://storage.googleapis.com/${BUCKET_NAME}/${blobName}`;
        const [id] = await db('products').insert({ name, description, catalog_id, image_url });
        const [newProduct] = await db('products').where({ id });
        res.status(201).json(newProduct);
      });

      blobStream.end(req.file.buffer);
      return; // End the request here, the blobStream 'finish' event will send the response.
    }

    const [id] = await db('products').insert({ name, description, catalog_id, image_url });
    const [newProduct] = await db('products').where({ id });
    res.status(201).json(newProduct);
  } catch (error) {
    // Handle foreign key constraint error if catalog_id is invalid
    if (error.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ message: 'Invalid catalog_id. The specified catalog does not exist.' });
    }
    res.status(500).json({ message: 'Error adding product', error });
  }
});

// --- 2. Remove a Product (Vendors only) ---
// DELETE /api/products/:id
router.delete('/:id', VENDOR_ONLY, async (req, res) => {
  const { id } = req.params;
  const vendor_id = req.user.userId;

  try {
    // Ownership Check and get old image URL
    const product = await db('products')
      .join('catalogs', 'products.catalog_id', 'catalogs.id')
      .where('products.id', id)
      .select('catalogs.vendor_id', 'products.image_url')
      .first();

    if (!product) {
      res.status(404).json({ message: `Product with id ${id} not found.` });
    } else if (product.vendor_id !== vendor_id) {
      res.status(403).json({ message: 'Forbidden: You do not own this product.' });
    } else {
      // If the product has an image, delete it from GCS
      if (product.image_url) {
        try {
          const oldImageFilename = product.image_url.split(`${BUCKET_NAME}/`)[1];
          await bucket.file(oldImageFilename).delete();
        } catch (err) {
          console.error("Error deleting product image from GCS during product removal:", err);
        }
      }

      await db('products').where({ id }).del();
      res.status(200).json({ message: `Product with id ${id} and its image have been removed.` });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error removing product', error });
  }
});

// --- 3. Update a Product (Vendors only) ---
// PUT /api/products/:id
router.put('/:id', VENDOR_ONLY, upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const changes = req.body;
  delete changes.image_url; // Prevent image_url from being updated directly from body
  const vendor_id = req.user.userId;

  if (Object.keys(changes).length === 0 && !req.file) {
    return res.status(400).json({ message: 'No update information provided.' });
  }

  try {
    // Ownership Check
    const product = await db('products')
      .join('catalogs', 'products.catalog_id', 'catalogs.id')
      .where('products.id', id)
      .select('catalogs.vendor_id', 'products.image_url as old_image_url')
      .first();

    if (!product) {
      res.status(404).json({ message: `Product with id ${id} not found.` });
    } else if (product.vendor_id !== vendor_id) {
      res.status(403).json({ message: 'Forbidden: You do not own this product.' });
    } else {
      // If a new file is uploaded, handle the GCS upload and old image deletion
      if (req.file) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const blobName = `products/${req.file.fieldname}-${uniqueSuffix}${path.extname(req.file.originalname)}`;
        const blob = bucket.file(blobName);

        const blobStream = blob.createWriteStream({
          resumable: false,
        });

        blobStream.on('error', err => res.status(500).json({ message: 'Could not upload image to GCS.', error: err }));

        blobStream.on('finish', async () => {
          changes.image_url = `https://storage.googleapis.com/${BUCKET_NAME}/${blobName}`;

          // Delete the old image from GCS after the new one is successfully uploaded
          if (product.old_image_url) {
            try {
              const oldImageFilename = product.old_image_url.split(`${BUCKET_NAME}/`)[1];
              await bucket.file(oldImageFilename).delete();
            } catch (err) {
              console.error("Error deleting old product image from GCS:", err);
            }
          }

          await db('products').where({ id }).update(changes);
          const updatedProduct = await db('products').where({ id }).first();
          res.status(200).json(updatedProduct);
        });

        blobStream.end(req.file.buffer);
        return; // End the request here, the blobStream 'finish' event will send the response.
      }

      await db('products').where({ id }).update(changes);
      const updatedProduct = await db('products').where({ id }).first();
      res.status(200).json(updatedProduct);
    }
  } catch (error) {
    // Handle foreign key constraint error if catalog_id is invalid
    if (error.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ message: 'Invalid catalog_id. The specified catalog does not exist.' });
    }
    res.status(500).json({ message: 'Error updating product', error });
  }
});

// --- 4. Like/Unlike a Product (Vets only) ---
// POST /api/products/:id/like
router.post('/:id/like', VET_ONLY, async (req, res) => {
  const { id: product_id } = req.params;
  const user_id = req.user.userId;

  try {
    // Check if the product exists
    const product = await db('products').where({ id: product_id }).first();
    if (!product) {
      return res.status(404).json({ message: `Product with id ${product_id} not found.` });
    }

    // Check if the user currently likes the product
    const existingLike = await db('product_likes')
      .where({ user_id, product_id })
      .first();

    if (existingLike) {
      // Unlike the product
      await db('product_likes').where({ id: existingLike.id }).del();
      await db('product_events').insert({ user_id, product_id, event_type: 'unliked' }); // Still log the event
      res.status(200).json({ liked: false, message: 'Product unliked.' });
    } else {
      // Like the product
      await db('product_likes').insert({ user_id, product_id });
      await db('product_events').insert({ user_id, product_id, event_type: 'liked' }); // Still log the event
      res.status(200).json({ liked: true, message: 'Product liked.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error processing like request', error });
  }
});

// --- 5. Request a budget for a Product (Vets only) ---
// POST /api/products/:id/request-budget
router.post('/:id/request-budget', VET_ONLY, async (req, res) => {
  const { id: product_id } = req.params;
  const user_id = req.user.userId;
  const { message } = req.body;

  try {
    // Check if the product exists
    const product = await db('products').where({ id: product_id }).first();
    if (!product) {
      return res.status(404).json({ message: `Product with id ${product_id} not found.` });
    }

    // Insert the budget request event
    await db('product_events').insert({
      user_id,
      product_id,
      event_type: 'budget_requested',
      message: message || null, // Store message, or null if not provided
    });

    res.status(200).json({ message: 'Budget request submitted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing budget request', error });
  }
});

module.exports = router;