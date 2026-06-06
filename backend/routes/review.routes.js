const router = require('express').Router();
const { getReviews, createReview, deleteReview } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/:productId', getReviews);
router.post('/:productId', protect, createReview);
router.delete('/:productId/:reviewId', protect, deleteReview);

module.exports = router;
