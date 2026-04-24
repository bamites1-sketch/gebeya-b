const router = require('express').Router();
const { createOrder, getMyOrders } = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/', createOrder);
router.get('/my', getMyOrders);

module.exports = router;
