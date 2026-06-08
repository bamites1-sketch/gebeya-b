// gebeya-B backend — v1.1
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowed = (process.env.ALLOWED_ORIGINS || 'https://gebeya-b.vercel.app,http://localhost:5173').split(',').map(s => s.trim());
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors()); // handle preflight for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/cart', require('./routes/cart.routes'));
app.use('/api/wishlist', require('./routes/wishlist.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/payments', require('./routes/payment.routes'));

app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/seller', require('./routes/seller.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Public site config — returns payment accounts for checkout page (no auth)
app.get('/api/config/payment', async (req, res) => {
  try {
    const prisma = require('./lib/prisma');
    const rows = await prisma.siteConfig.findMany({
      where: { key: { startsWith: 'payment_' } },
    });
    res.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
  } catch {
    res.json({});
  }
});

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

// Temporary SMTP diagnostics — shows env vars are loaded (no secrets exposed)
app.get('/api/debug/smtp', (req, res) => {
  res.json({
    SMTP_HOST:  process.env.SMTP_HOST   || 'NOT SET',
    SMTP_PORT:  process.env.SMTP_PORT   || 'NOT SET',
    SMTP_USER:  process.env.SMTP_USER   || 'NOT SET',
    SMTP_PASS:  process.env.SMTP_PASS   ? `SET (${process.env.SMTP_PASS.length} chars)` : 'NOT SET',
    FROM_EMAIL: process.env.FROM_EMAIL  || 'NOT SET',
    FRONTEND_URL: process.env.FRONTEND_URL || 'NOT SET',
  });
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
