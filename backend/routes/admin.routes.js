const router = require('express').Router();
const { getAllOrders, updateOrderStatus } = require('../controllers/order.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const prisma = require('../lib/prisma');

router.use(protect, adminOnly);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, verified: true, shopName: true, createdAt: true },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Verify / unverify a seller
router.put('/users/:id/verify', async (req, res, next) => {
  try {
    const { verified } = req.body;
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { verified: Boolean(verified) },
      select: { id: true, name: true, email: true, role: true, verified: true },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalPrice: true } }),
    ]);
    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: revenue._sum.totalPrice || 0,
    });
  } catch (error) {
    next(error);
  }
});

// ── Site Config (payment accounts) ──────────────────────────────
router.get('/config', async (req, res, next) => {
  try {
    const rows = await prisma.siteConfig.findMany();
    // Convert array of {key, value} to a plain object
    const config = Object.fromEntries(rows.map(r => [r.key, r.value]));
    res.json(config);
  } catch (error) {
    next(error);
  }
});

router.put('/config', async (req, res, next) => {
  try {
    const updates = req.body; // { key: value, ... }
    if (typeof updates !== 'object' || Array.isArray(updates)) {
      return res.status(400).json({ message: 'Body must be a key-value object' });
    }
    // Upsert each key
    await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        prisma.siteConfig.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );
    const rows = await prisma.siteConfig.findMany();
    res.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
  } catch (error) {
    next(error);
  }
});

module.exports = router;

