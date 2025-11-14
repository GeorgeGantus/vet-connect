const express = require('express');
const db = require('../db/db-config');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

const router = express.Router();

const VENDOR_ONLY = [authenticate, authorize(['vendor'])];
const VET_ONLY = [authenticate, authorize(['veterinarian'])];

// Helper function to generate a random alphanumeric code
const generateCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// --- Create a new Catalog (Vendors only) ---
// POST /api/catalogs
router.post(
  '/',
  VENDOR_ONLY,
  async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Catalog name is required.' });
    }

    const vendor_id = req.user.userId;
    const access_code = generateCode();

    try {
      const [idItem] = await db('catalogs').insert({ name, description, vendor_id, access_code }).returning('id');
      const id = idItem.id || idItem;
      const [newCatalog] = await db('catalogs').where({ id });
      res.status(201).json(newCatalog);
    } catch (error) {
      res.status(500).json({ message: 'Error creating catalog', error });
    }
  }
);

// --- 1. Update a Catalog (Owner only) ---
// PUT /api/catalogs/:id
router.put('/:id', VENDOR_ONLY, async (req, res) => {
  const { id } = req.params;
  const changes = req.body;
  const vendor_id = req.user.userId;

  try {
    const catalog = await db('catalogs').where({ id }).first();

    if (!catalog) {
      return res.status(404).json({ message: `Catalog with id ${id} not found.` });
    }

    if (catalog.vendor_id !== vendor_id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this catalog.' });
    }

    await db('catalogs').where({ id }).update(changes);
    const updatedCatalog = await db('catalogs').where({ id }).first();
    res.status(200).json(updatedCatalog);

  } catch (error) {
    res.status(500).json({ message: 'Error updating catalog', error });
  }
});

// --- 2. Delete a Catalog (Owner only) ---
// DELETE /api/catalogs/:id
router.delete('/:id', VENDOR_ONLY, async (req, res) => {
  const { id } = req.params;
  const vendor_id = req.user.userId;

  try {
    const catalog = await db('catalogs').where({ id }).first();

    if (!catalog) {
      return res.status(404).json({ message: `Catalog with id ${id} not found.` });
    }

    if (catalog.vendor_id !== vendor_id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this catalog.' });
    }

    await db('catalogs').where({ id }).del();
    res.status(200).json({ message: `Catalog with id ${id} has been deleted.` });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting catalog', error });
  }
});

// --- 2. Get a Vendor's Own Catalogs ---
// GET /api/catalogs/my-catalogs
router.get('/my-catalogs', VENDOR_ONLY, async (req, res) => {
  const vendor_id = req.user.userId;

  try {
    const catalogs = await db('catalogs')
      .select('catalogs.*')
      .count('products.id as product_count')
      .leftJoin('products', 'catalogs.id', 'products.catalog_id')
      .where('catalogs.vendor_id', vendor_id)
      .groupBy('catalogs.id')
      .orderBy('catalogs.id', 'desc');
    res.status(200).json(catalogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching catalogs', error });
  }
});

// --- 3. Get a specific catalog with its products (for owner) ---
// GET /api/catalogs/:id/products
router.get('/:id/products', VENDOR_ONLY, async (req, res) => {
  const { id } = req.params;
  const vendor_id = req.user.userId;

  try {
    const catalog = await db('catalogs').where({ id, vendor_id }).first();

    if (!catalog) {
      return res.status(404).json({ message: 'Catalog not found or you do not have permission to view it.' });
    }

    const products = await db('products').where({ catalog_id: id }).orderBy('name', 'asc');

    res.status(200).json({ ...catalog, products });
  } catch (error) {
    console.error('Error fetching catalog with products:', error);
    res.status(500).json({ message: 'Error fetching catalog and products', error });
  }
});

// --- 5. Get events for a specific catalog (for owner) ---
// GET /api/catalogs/:id/events
router.get('/:id/events', VENDOR_ONLY, async (req, res) => {
  const { id: catalog_id } = req.params;
  const vendor_id = req.user.userId;

  try {
    // 1. Verify ownership of the catalog
    const catalog = await db('catalogs').where({ id: catalog_id, vendor_id }).first();
    if (!catalog) {
      return res.status(404).json({ message: 'Catalog not found or you do not have permission.' });
    }

    // 2. Fetch events for this specific catalog
    const events = await db('product_events')
      .join('products', 'product_events.product_id', 'products.id')
      .join('users', 'product_events.user_id', 'users.id')
      .where('products.catalog_id', catalog_id)
      .select(
        'products.name as product_name',
        'users.name as user_name',
        'product_events.event_type',
        db.raw("strftime('%Y-%m-%dT%H:%M:%fZ', product_events.created_at) as created_at"), // Corrected from previous step
        'product_events.message',
        'users.phone_number as user_phone_number'
      )
      .orderBy('product_events.created_at', 'desc');

    res.status(200).json({ catalog, events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching catalog events', error });
  }
});

// --- 4. Get all events for a vendor's catalogs ---
// GET /api/catalogs/events
router.get('/events', VENDOR_ONLY, async (req, res) => {
  const vendor_id = req.user.userId;

  try {
    const productEventsQuery = db('product_events')
      .join('products', 'product_events.product_id', 'products.id')
      .join('catalogs', 'products.catalog_id', 'catalogs.id')
      .join('users', 'product_events.user_id', 'users.id')
      .where('catalogs.vendor_id', vendor_id)
      .select(
        'product_events.id as id',
        'product_events.event_type as type',
        db.raw("strftime('%Y-%m-%dT%H:%M:%fZ', product_events.created_at) as created_at"),
        'products.name as product_name',
        'catalogs.name as catalog_name',
        'users.name as user_name', // Corrected from previous step
        'users.phone_number as user_phone_number',
        'product_events.message'
      );

    const catalogEventsQuery = db('catalog_events')
      .join('catalogs', 'catalog_events.catalog_id', 'catalogs.id')
      .join('users', 'catalog_events.user_id', 'users.id')
      .where('catalogs.vendor_id', vendor_id)
      .select(
        'catalog_events.id as id',
        'catalog_events.event_type as type',
        db.raw("strftime('%Y-%m-%dT%H:%M:%fZ', catalog_events.created_at) as created_at"),
        db.raw('NULL as product_name'),
        'catalogs.name as catalog_name',
        'users.name as user_name', // Corrected from previous step
        'users.phone_number as user_phone_number',
        db.raw('NULL as message')
      );

    // Wrap the UNION in a subquery to ensure ORDER BY works correctly with SQLite
    const subquery = productEventsQuery.union(catalogEventsQuery);
    const events = await db
      .from(subquery.as('events'))
      .orderBy('created_at', 'desc')
      .limit(5);

    res.status(200).json(events);
  } catch (error) {
    console.log('Error fetching catalog data:', error);
    res.status(500).json({ message: 'Error fetching catalog events', error });
  }
});

// --- 1. Get Catalog and Products by Access Code ---
// GET /api/catalogs/view/:access_code
router.get('/view/:access_code', authenticate, async (req, res) => {
  const { access_code } = req.params;
  const user_id = req.user.userId;
  const user_role = req.user.role;

  try {
    // First, find the catalog by its access code
    const catalog = await db('catalogs')
      .join('users', 'catalogs.vendor_id', 'users.id')
      .where('catalogs.access_code', access_code)
      .select('catalogs.*', 'users.name as vendor_name')
      .first();

    if (!catalog) {
      return res.status(404).json({ message: 'Catalog not found.' });
    }

    // Log the 'viewed' event if the user is a veterinarian
    if (user_role === 'veterinarian') {
      await db('catalog_events').insert({
        user_id: user_id,
        catalog_id: catalog.id,
        event_type: 'viewed'
      });
    }

    // Next, find all products and check if the current user has liked them
    const products = await db('products')
      .select('products.*', db.raw('CASE WHEN product_likes.id IS NOT NULL THEN 1 ELSE 0 END as is_liked'))
      .leftJoin('product_likes', function() {
        this.on('product_likes.product_id', '=', 'products.id')
            .andOn('product_likes.user_id', '=', db.raw('?', [user_id]));
      })
      .where('products.catalog_id', catalog.id);

    // Combine the data and send the response
    res.status(200).json({
      ...catalog,
      products: products,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching catalog data', error });
  }
});

// --- Get Recently Viewed Catalogs for a Vet ---
// GET /api/catalogs/recently-viewed
router.get('/recently-viewed', VET_ONLY, async (req, res) => {
  const user_id = req.user.userId;

  try {
    // Subquery to get the most recent event for each catalog viewed by the user
    const subquery = db('catalog_events')
      .select('catalog_id', db.raw('MAX(created_at) as last_viewed_at'))
      .where({ user_id, event_type: 'viewed' })
      .groupBy('catalog_id');

    // Main query to get the catalog details
    const catalogs = await db('catalogs')
      .join(subquery.as('recent_events'), 'catalogs.id', 'recent_events.catalog_id')
      .join('users as vendor', 'catalogs.vendor_id', 'vendor.id')
      .select(
        'catalogs.id',
        'catalogs.name',
        'catalogs.description',
        'catalogs.access_code',
        'vendor.name as vendor_name'
      )
      .orderBy('recent_events.last_viewed_at', 'desc')
      .limit(10);

    res.status(200).json(catalogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recently viewed catalogs', error });
  }
});

// --- Get Clients who liked Vendor's Products ---
// GET /api/catalogs/clients
router.get('/clients', VENDOR_ONLY, async (req, res) => {
  const vendor_id = req.user.userId;

  try {
    // 1. Fetch all likes for products belonging to the vendor
    const likedProducts = await db('product_likes')
      .join('users', 'product_likes.user_id', 'users.id')
      .join('products', 'product_likes.product_id', 'products.id')
      .join('catalogs', 'products.catalog_id', 'catalogs.id')
      .where('catalogs.vendor_id', vendor_id)
      .select(
        'users.id as client_id',
        'users.name as client_name',
        'users.email as client_email',
        'users.phone_number as client_phone_number',
        'products.id as product_id',
        'products.name as product_name',
        'catalogs.id as catalog_id',
        'catalogs.name as catalog_name'
      )
      .orderBy('users.name');

    // 2. Group the results by client
    const clients = likedProducts.reduce((acc, item) => {
      // Find or create the client entry
      let client = acc.find(c => c.client_id === item.client_id);
      if (!client) {
        client = {
          client_id: item.client_id,
          client_name: item.client_name,
          client_email: item.client_email,
          client_phone_number: item.client_phone_number,
          liked_products: [],
        };
        acc.push(client);
      }

      // Add the liked product to the client's list
      client.liked_products.push({
        product_id: item.product_id,
        product_name: item.product_name,
        catalog_id: item.catalog_id,
        catalog_name: item.catalog_name,
      });

      return acc;
    }, []);

    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients who liked products:', error);
    res.status(500).json({ message: 'Error fetching client likes', error });
  }
});

// --- Get Dashboard Stats for a Vendor ---
// GET /api/catalogs/dashboard-stats
router.get('/dashboard-stats', VENDOR_ONLY, async (req, res) => {
  const vendor_id = req.user.userId;

  try {
    // 1. Get total likes count
    const totalLikesResult = await db('product_likes')
      .join('products', 'product_likes.product_id', 'products.id')
      .join('catalogs', 'products.catalog_id', 'catalogs.id')
      .where('catalogs.vendor_id', vendor_id)
      .count('product_likes.id as totalLikes')
      .first();

    const totalLikes = totalLikesResult.totalLikes || 0;

    // 2. Get top 5 liked products
    const topProducts = await db('products')
      .join('catalogs', 'products.catalog_id', 'catalogs.id')
      .leftJoin('product_likes', 'products.id', 'product_likes.product_id')
      .where('catalogs.vendor_id', vendor_id)
      .select('products.id', 'products.name')
      .count('product_likes.id as likes')
      .groupBy('products.id', 'products.name')
      .orderBy('likes', 'desc')
      .limit(5);

    // Filter out products with 0 likes if you only want to show products that have been liked at least once
    const filteredTopProducts = topProducts.filter(p => p.likes > 0);

    res.status(200).json({
      totalLikes,
      topProducts: filteredTopProducts,
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics', error });
  }
});


module.exports = router;