const prisma = require('../lib/prisma');

const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
    });
    res.json(wishlist);
  } catch (error) {
    next(error);
  }
};

const toggleWishlist = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId);
    let wishlist = await prisma.wishlist.findUnique({ where: { userId: req.user.id } });
    if (!wishlist) wishlist = await prisma.wishlist.create({ data: { userId: req.user.id } });

    const existing = await prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return res.json({ added: false, message: 'Removed from wishlist' });
    }

    await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
    res.json({ added: true, message: 'Added to wishlist' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWishlist, toggleWishlist };

