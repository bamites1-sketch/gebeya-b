const router = require('express').Router();
const { initializePayment, verifyPayment, paymentCallback } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/initialize', protect, initializePayment);
router.get('/verify/:tx_ref', protect, verifyPayment);
router.get('/callback/:tx_ref', paymentCallback);

module.exports = router;
