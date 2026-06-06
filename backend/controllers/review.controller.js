const prisma = require('../lib/prisma');
const { createNotification } = require('./notification.controller');

const getReviews = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const avg = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
    res.json({ reviews, average: Math.round(avg * 10) / 10, total: reviews.length });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (!comment?.trim()) {
      return res.status(400).json({ message: 'Comment is required' });
    }
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });
    if (existing) {
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: { rating: parseInt(rating), comment: comment.trim() },
        include: { user: { select: { id: true, name: true } } },
      });
      return res.json(updated);
    }
    const review = await prisma.review.create({
      data: { rating: parseInt(rating), comment: comment.trim(), userId: req.user.id, productId },
      include: { user: { select: { id: true, name: true } } },
    });

    // Notify the seller if product has a seller
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true, sellerId: true } });
    if (product?.sellerId) {
      await createNotification({
        userId: product.sellerId,
        title: 'New Review',
        message: `${req.user.name} left a ${rating}⭐ review on "${product.name}".`,
        type: 'REVIEW',
        link: `/products/${productId}`,
      });
    }

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: parseInt(req.params.reviewId) } });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await prisma.review.delete({ where: { id: review.id } });
    res.json({ message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReviews, createReview, deleteReview };
