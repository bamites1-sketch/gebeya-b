const prisma = require('../lib/prisma');
const https = require('https');

const CHAPA_SECRET = process.env.CHAPA_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://gebeya-b.vercel.app';
const BACKEND_URL  = process.env.BACKEND_URL  || 'https://gebeya-b-api.onrender.com';

function chapaRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.chapa.co',
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch { reject(new Error('Invalid JSON from Chapa')); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const initializePayment = async (req, res, next) => {
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
        status: 'PENDING',
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    });
    const txRef = `GEB-${order.id}-${Date.now()}`;
    await prisma.order.update({ where: { id: order.id }, data: { txRef } });
    const chapaPayload = {
      amount: String(Math.round(totalPrice)),
      currency: 'ETB',
      email: req.user.email,
      first_name: (req.user.name.split(' ')[0] || 'User').substring(0, 50),
      last_name: (req.user.name.split(' ').slice(1).join(' ') || 'Customer').substring(0, 50),
      tx_ref: txRef,
      callback_url: `${BACKEND_URL}/api/payments/callback/${txRef}`,
      return_url: `${FRONTEND_URL}/payment-success?tx_ref=${txRef}`,
      title: 'gebeya-B Order',
      description: `Order ${order.id}`,
    };

    const chapaRes = await chapaRequest('POST', '/v1/transaction/initialize', chapaPayload);
    console.log('Chapa response:', JSON.stringify(chapaRes));
    if (chapaRes.status !== 'success') {
      console.log('Chapa payload sent:', JSON.stringify(chapaPayload));
      return res.status(400).json({ message: chapaRes.message || JSON.stringify(chapaRes) });
    }
    res.json({ checkout_url: chapaRes.data.checkout_url, tx_ref: txRef, order_id: order.id });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { tx_ref } = req.params;
    const chapaRes = await chapaRequest('GET', `/v1/transaction/verify/${tx_ref}`);
    console.log('Verify response:', JSON.stringify(chapaRes));

    // Find the order regardless of payment status (for demo purposes)
    const order = await prisma.order.findFirst({
      where: { txRef: tx_ref },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If already processed, return it
    if (order.status === 'PROCESSING') {
      return res.json({ message: 'Payment verified', order });
    }

    // Accept success or treat cancelled as success for demo
    const chapaStatus = chapaRes?.data?.status;
    const isPaid = chapaRes.status === 'success' &&
      ['success', 'completed', 'COMPLETED'].includes(chapaStatus);

    // Update order status
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: isPaid ? 'PROCESSING' : 'PENDING' },
      include: { items: { include: { product: true } } },
    });

    if (isPaid) {
      // Decrement stock only if actually paid
      await Promise.all(
        order.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );
      // Clear cart
      const cart = await prisma.cart.findUnique({ where: { userId: order.userId } });
      if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    // Always return the order so UI can show it
    res.json({ message: isPaid ? 'Payment verified' : 'Order created', order: updated });
  } catch (error) {
    next(error);
  }
};
    const order = await prisma.order.findFirst({
      where: { txRef: tx_ref },
      include: { items: { include: { product: true } } },
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'PROCESSING') return res.json({ message: 'Already verified', order });
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PROCESSING' },
      include: { items: { include: { product: true } } },
    });
    await Promise.all(
      order.items.map((item) =>
        prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })
      )
    );
    const cart = await prisma.cart.findUnique({ where: { userId: order.userId } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ message: 'Payment verified', order: updated });
  } catch (error) {
    next(error);
  }
};

const paymentCallback = async (req, res) => {
  res.json({ status: 'received' });
};

module.exports = { initializePayment, verifyPayment, paymentCallback };
