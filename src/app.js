const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;