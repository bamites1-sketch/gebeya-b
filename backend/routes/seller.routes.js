const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
  applyToSell,
  updateSellerProfile,
  getMyProducts,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerStats,
} = require('../controllers/seller.controller');

// Seller protection middleware
const sellerOnly = (req, res, next) => {
  if (req.user.role !== 'SELLER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Seller account required' });
  }
  next();
};

router.post('/apply', protect, applyToSell);
router.put('/profile', protect, sellerOnly, updateSellerProfile);
router.get('/products', protect, sellerOnly, getMyProducts);
router.get('/stats', protect, sellerOnly, getSellerStats);
router.post('/products', protect, sellerOnly, upload.array('images', 5), createSellerProduct);
router.put('/products/:id', protect, sellerOnly, upload.array('images', 5), updateSellerProduct);
router.delete('/products/:id', protect, sellerOnly, deleteSellerProduct);

module.exports = router;
