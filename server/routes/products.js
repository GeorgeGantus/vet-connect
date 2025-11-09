const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/db-config');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

// --- Multer Configuration for Product Image Uploads ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Resolve path to be relative to this file's directory, going up to the project root
    // and then into the client's public upload folder.
    const uploadPath = path.resolve(__dirname, '..', '..', 'client', 'public', 'uploads', 'products');
    fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create a unique filename to avoid overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const VENDOR_ONLY = [authenticate, authorize(['vendor'])];
const VET_ONLY = [authenticate, authorize(['veterinarian'])];

// --- 1. Add a new Product (Vendors only) ---
// POST /api/products
router.post('/', VENDOR_ONLY, upload.single('image'), async (req, res) => {
  const { name, description, catalog_id } = req.body;

  // The image URL to be saved in the database
  const image_url = req.file ? `/uploads/products/${req.file.filename}` : null;

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
    // Ownership Check: Join product with catalog to check vendor_id
    const product = await db('products')
      .join('catalogs', 'products.catalog_id', 'catalogs.id')
      .where('products.id', id)
      .select('catalogs.vendor_id')
      .first();

    if (!product) {
      res.status(404).json({ message: `Product with id ${id} not found.` });
    } else if (product.vendor_id !== vendor_id) {
      res.status(403).json({ message: 'Forbidden: You do not own this product.' });
    } else {
      await db('products').where({ id }).del();
      res.status(200).json({ message: `Product with id ${id} has been removed.` });
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
  const vendor_id = req.user.userId;

  if (req.file) {
    changes.image_url = `/uploads/products/${req.file.filename}`;
  }
  if (!changes.name && !changes.description && !changes.catalog_id && !changes.image_url) {
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
      // If a new image is uploaded and an old one exists, delete the old one.
      if (req.file && product.old_image_url) {
        const oldImagePath = path.join('src/client/public', product.old_image_url);
        fs.unlink(path.resolve(__dirname, '..', '..', 'client', 'public', product.old_image_url), (err) => {
          if (err) console.error("Error deleting old product image:", err);
        });
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