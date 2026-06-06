const prisma = require('../lib/prisma');

// Apply to become a seller
const applyToSell = async (req, res, next) => {
  try {
    const { shopName, bio } = req.body;
    if (!shopName?.trim()) return res.status(400).json({ message: 'Shop name is required' });

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        role: 'SELLER',
        shopName: shopName.trim(),
        bio: bio?.trim() || null,
      },
      select: { id: true, name: true, email: true, role: true, shopName: true, bio: true },
    });
    res.json({ message: 'Seller account activated', user });
  } catch (error) {
    next(error);
  }
};

// Update seller profile (shop name, bio)
const updateSellerProfile = async (req, res, next) => {
  try {
    const { shopName, bio } = req.body;
    const data = {};
    if (shopName) data.shopName = shopName.trim();
    if (bio !== undefined) data.bio = bio?.trim() || null;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, name: true, email: true, role: true, shopName: true, bio: true },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Get seller's own products
const getMyProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { sellerId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// Create a product as seller
const createSellerProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, region, stock } = req.body;
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'name, description, price and category are required' });
    }
    const images = req.files && req.files.length > 0
      ? req.files.map((f) => `/uploads/${f.filename}`)
      : req.body.imageUrls
        ? JSON.parse(req.body.imageUrls)
        : [];
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        images: JSON.stringify(images),
        category,
        region: region || null,
        stock: parseInt(stock) || 0,
        sellerId: req.user.id,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// Update own product
const updateSellerProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.sellerId !== req.user.id) return res.status(403).json({ message: 'Not your product' });

    const { name, description, price, category, region, stock } = req.body;
    const data = {};
    if (name) data.name = name;
    if (description) data.description = description;
    if (price) data.price = parseFloat(price);
    if (category) data.category = category;
    if (region !== undefined) data.region = region || null;
    if (stock !== undefined) data.stock = parseInt(stock);
    if (req.files?.length) data.images = JSON.stringify(req.files.map((f) => `/uploads/${f.filename}`));

    const updated = await prisma.product.update({ where: { id: productId }, data });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Delete own product
const deleteSellerProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.sellerId !== req.user.id) return res.status(403).json({ message: 'Not your product' });

    await prisma.product.delete({ where: { id: productId } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};

// Get seller stats
const getSellerStats = async (req, res, next) => {
  try {
    const [totalProducts, totalSold] = await Promise.all([
      prisma.product.count({ where: { sellerId: req.user.id } }),
      prisma.orderItem.aggregate({
        where: { product: { sellerId: req.user.id } },
        _sum: { quantity: true },
      }),
    ]);
    res.json({
      totalProducts,
      totalSold: totalSold._sum.quantity || 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { applyToSell, updateSellerProfile, getMyProducts, createSellerProduct, updateSellerProduct, deleteSellerProduct, getSellerStats };
