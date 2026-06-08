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

// Temporary SMTP test — fires a real email and returns the result
app.get('/api/debug/smtp-test', async (req, res) => {
  try {
    const nodemailer = require('nodemailer');
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } = process.env;
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '465'),
      secure: SMTP_PORT === '465',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    await transport.sendMail({
      from: `"gebeya-B test" <${FROM_EMAIL}>`,
      to: SMTP_USER,
      subject: 'Render SMTP test',
      text: 'If you see this, SMTP works from Render.',
    });
    res.json({ ok: true, message: 'Email sent successfully' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
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
