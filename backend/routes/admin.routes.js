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

module.exports = router;

