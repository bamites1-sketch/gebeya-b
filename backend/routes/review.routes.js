const router = require('express').Router({ mergeParams: true });
const { getReviews, createReview, deleteReview } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', getReviews);
router.post('/', protect, createReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;
