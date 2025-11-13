const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db-config');

const router = express.Router();

// --- User Registration ---
// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role, phone_number } = req.body;

  if (!name || !email || !password || !phone_number) {
    return res.status(400).json({ message: 'Name, email, password, and phone number are required.' });
  }

  // Validate the user role
  const allowedRoles = ['veterinarian', 'vendor'];
  if (role && !allowedRoles.includes(role)) {
    return res.status(400).json({ message: `Invalid role. Role must be one of: ${allowedRoles.join(', ')}.` });
  }

  try {
    // Hash the password
    const password_hash = await bcrypt.hash(password, 12);

    // Save the new user to the database
    const [id] = await db('users').insert({
      name,
      email,
      phone_number,
      password_hash,
      role: role || 'veterinarian', // Default role if not provided
    }).returning('id');

    const [newUser] = await db('users')
      .where({ id })
      .select('id', 'name', 'email', 'phone_number', 'role');

    // --- Generate JWT Token ---
    const payload = {
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone_number: newUser.phone_number,
      role: newUser.role,
    };

    //const token = jwt.sign(payload, process.env.JWT_SECRET, {
    //  expiresIn: '1d', // Token expires in 1 day
    //});
    token = 'TEMPORARY_TOKEN_FOR_DEMO_PURPOSES';
    res.status(201).json({
      message: `Welcome ${newUser.email}! Your registration was successful.`,
      token,
    });
  } catch (error) {
    // Handle case where email is already taken
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ message: 'Uma conta com este email já existe.' });
    }
    res.status(500).json({ message: 'Erro ao registrar novo usuário.', error });
  }
});

// --- User Login ---
// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
  }

  try {
    const user = await db('users').where({ email }).first();

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      // Passwords match, generate a token
      const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
      });

      res.json({
        message: `Welcome ${user.email}!`,
        token,
      });
    } else {
      // User not found or password incorrect
      res.status(401).json({ message: 'Credenciais invalidas.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao logar.', error });
  }
});

module.exports = router;
