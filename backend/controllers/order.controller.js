const prisma = require('../lib/prisma');
const { createNotification } = require('./notification.controller');

const createOrder = async (req, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const totalPrice = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalPrice,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Decrement stock
    await Promise.all(
      cart.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // Notify buyer
    await createNotification({
      userId: req.user.id,
      title: 'Order Placed Successfully',
      message: `Your order #${order.id} for ${totalPrice.toLocaleString()} ETB has been placed.`,
      type: 'ORDER',
      link: '/profile',
    });

    // Notify sellers of their products being ordered
    const sellerIds = [...new Set(cart.items.map(i => i.product.sellerId).filter(Boolean))];
    await Promise.all(sellerIds.map(sellerId =>
      createNotification({
        userId: sellerId,
        title: 'New Order Received',
        message: `You have a new order #${order.id}! Check your seller dashboard.`,
        type: 'SELLER',
        link: '/seller',
      })
    ));

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    await Promise.all(admins.map(admin =>
      createNotification({
        userId: admin.id,
        title: 'New Order',
        message: `Order #${order.id} placed for ${totalPrice.toLocaleString()} ETB.`,
        type: 'ADMIN',
        link: '/admin',
      })
    ));

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: { select: { id: true, name: true, email: true } }, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const VALID_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };

