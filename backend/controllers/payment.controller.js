const prisma = require('../lib/prisma');
const https = require('https');
const { sendInvoiceEmail, sendSellerSaleEmails } = require('../services/email.service');

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
    const subtotal   = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const TAX_RATE   = 0.15;
    const tax        = Math.round(subtotal * TAX_RATE);
    const totalPrice = subtotal + tax;

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
    const nameParts = req.user.name.trim().split(/\s+/);
    const firstName = nameParts[0].substring(0, 50);
    const lastName = (nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0]).substring(0, 50);

    // Chapa's email validator rejects custom domains (e.g. @gebeya-b.com, @company.et).
    // Normalise to a guaranteed-valid format: keep the local part, force @gmail.com as
    // the domain only in the Chapa payload. Invoice emails still use the real address.
    const rawEmail = req.user.email.trim().toLowerCase();
    const emailLocal = rawEmail.split('@')[0].replace(/[^a-z0-9._+-]/g, '');
    const chapaEmail = `${emailLocal}@gmail.com`;

    const chapaPayload = {
      amount: String(Math.round(totalPrice)),
      currency: 'ETB',
      email: chapaEmail,
      first_name: firstName,
      last_name: lastName,
      tx_ref: txRef,
      callback_url: `${BACKEND_URL}/api/payments/callback/${txRef}`,
      return_url: `${FRONTEND_URL}/payment-success?tx_ref=${txRef}`,
      title: 'gebeya-B Order',
      description: `Order ${order.id}`,
      customization: {
        title: 'gebeya-B',
        description: `Order #${order.id}`,
      },
    };
    const chapaRes = await chapaRequest('POST', '/v1/transaction/initialize', chapaPayload);
    console.log('Chapa init response:', JSON.stringify(chapaRes));
    if (chapaRes.status !== 'success') {
      // Surface Chapa's actual error message to the frontend
      const errorMsg = typeof chapaRes.message === 'object'
        ? Object.entries(chapaRes.message).map(([k, v]) => `${k}: ${v}`).join(', ')
        : chapaRes.message || 'Payment initialization failed';
      return res.status(400).json({ message: errorMsg });
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

    const order = await prisma.order.findFirst({
      where: { txRef: tx_ref },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'PROCESSING') {
      return res.json({ message: 'Payment verified', order });
    }

    const chapaStatus = chapaRes?.data?.status;
    const isPaid = chapaRes.status === 'success' &&
      ['success', 'completed', 'COMPLETED'].includes(chapaStatus);

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: isPaid ? 'PROCESSING' : 'PENDING' },
      include: { items: { include: { product: true } } },
    });

    if (isPaid) {
      await Promise.all(
        order.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );
      const cart = await prisma.cart.findUnique({ where: { userId: order.userId } });
      if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

      const buyer = await prisma.user.findUnique({
        where: { id: order.userId },
        select: { name: true, email: true },
      });
      sendInvoiceEmail(updated, buyer).catch((err) =>
        console.error('Invoice email failed:', err.message)
      );
      sendSellerSaleEmails(updated).catch((err) =>
        console.error('Seller sale email failed:', err.message)
      );
    }

    res.json({ message: isPaid ? 'Payment verified' : 'Order created', order: updated });
  } catch (error) {
    next(error);
  }
};

const paymentCallback = async (req, res) => {
  res.json({ status: 'received' });
};

module.exports = { initializePayment, verifyPayment, paymentCallback };
