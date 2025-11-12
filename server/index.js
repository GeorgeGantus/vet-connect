require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors'); // 1. Import the cors package
const db = require('./db/db-config.js');

const authRouter = require('./routes/auth');
const catalogsRouter = require('./routes/catalogs');
const productsRouter = require('./routes/products');
const authenticate = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT || 8080; // Choose a port

// Middleware to parse JSON bodies
app.use(express.json());

app.use(cors()); // 2. Apply the cors middleware

// Routes
app.use('/api/auth', authRouter);
app.use('/api/catalogs', catalogsRouter);
app.use('/api/products', productsRouter);

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Example API endpoint to get all users
app.get('/api/users', authenticate, async (req, res) => {
  try {
    // Now accessible via req.user from the middleware
    console.log('Authenticated user:', req.user);

    const users = await db('users').select('id', 'email', 'role', 'created_at');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});