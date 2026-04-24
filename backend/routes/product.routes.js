const router = require('express').Router();
const {
  getProducts, getProduct, getTrending, getRelated,
  createProduct, updateProduct, deleteProduct,
} = require('../controllers/product.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', getProducts);
router.get('/trending', getTrending);
router.get('/:id', getProduct);
router.get('/:id/related', getRelated);
router.post('/', protect, adminOnly, upload.array('images', 5), createProduct);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
