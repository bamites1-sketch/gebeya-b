const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/wishlist', require('./routes/wishlist.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Gebeya-B API',
    version: '1.0.0',
    description: 'Ethiopian Cultural Marketplace REST API',
    endpoints: {
      auth:     '/api/auth',
      products: '/api/products',
      cart:     '/api/cart',
      wishlist: '/api/wishlist',
      orders:   '/api/orders',
      admin:    '/api/admin',
      health:   '/api/health',
    },
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gebeya-B API is running' });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// Error handling middleware
app.use(require('./middleware/error.middleware'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Gebeya-B server running on port ${PORT}`);
});

module.exports = app;
