const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    secure: SMTP_PORT === '465',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return transporter;
}

function buildInvoiceHtml({ order, buyer }) {
  const items = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.product.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${item.price.toLocaleString()} ETB</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${(item.price * item.quantity).toLocaleString()} ETB</td>
        </tr>`
    )
    .join('');

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#2C1810">
      <h2 style="color:#F19A0E">gebeya-B Invoice</h2>
      <p>Hi ${buyer.name},</p>
      <p>Thank you for your purchase! Here is your order invoice.</p>
      <table style="width:100%;margin:16px 0;font-size:14px">
        <tr><td><strong>Order #</strong></td><td>${order.id}</td></tr>
        <tr><td><strong>Date</strong></td><td>${new Date(order.createdAt).toLocaleString()}</td></tr>
        ${order.txRef ? `<tr><td><strong>Reference</strong></td><td>${order.txRef}</td></tr>` : ''}
        <tr><td><strong>Status</strong></td><td>${order.status}</td></tr>
      </table>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#F5F0E8">
            <th style="padding:8px;text-align:left">Item</th>
            <th style="padding:8px">Qty</th>
            <th style="padding:8px;text-align:right">Price</th>
            <th style="padding:8px;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${items}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:12px 8px;text-align:right;font-weight:bold">Grand Total</td>
            <td style="padding:12px 8px;text-align:right;font-weight:bold;color:#F19A0E">${order.totalPrice.toLocaleString()} ETB</td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top:24px;font-size:13px;color:#666">Questions? Reply to this email or visit gebeya-B.</p>
    </div>
  `;
}

async function sendInvoiceEmail(order, buyer) {
  const transport = getTransporter();
  if (!transport || !buyer?.email) {
    console.log('Invoice email skipped (SMTP not configured or no buyer email)');
    return false;
  }

  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  await transport.sendMail({
    from: `"gebeya-B" <${from}>`,
    to: buyer.email,
    subject: `Invoice for Order #${order.id} — gebeya-B`,
    html: buildInvoiceHtml({ order, buyer }),
  });
  return true;
}

// Build HTML for the seller sale notification email
function buildSellerSaleHtml({ order, seller, saleItems }) {
  const rows = saleItems
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.product.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${item.price.toLocaleString()} ETB</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${(item.price * item.quantity).toLocaleString()} ETB</td>
        </tr>`
    )
    .join('');

  const subtotal = saleItems.reduce((s, i) => s + i.price * i.quantity, 0);

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#2C1810">
      <h2 style="color:#078930">🎉 New Sale on gebeya-B</h2>
      <p>Hi ${seller.name || seller.shopName},</p>
      <p>Great news! You have a new sale from Order <strong>#${order.id}</strong>. Here are the details:</p>
      <table style="width:100%;margin:16px 0;font-size:14px">
        <tr><td><strong>Order #</strong></td><td>${order.id}</td></tr>
        <tr><td><strong>Date</strong></td><td>${new Date(order.createdAt).toLocaleString()}</td></tr>
        ${order.txRef ? `<tr><td><strong>Reference</strong></td><td>${order.txRef}</td></tr>` : ''}
      </table>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#F5F0E8">
            <th style="padding:8px;text-align:left">Item</th>
            <th style="padding:8px">Qty</th>
            <th style="padding:8px;text-align:right">Price</th>
            <th style="padding:8px;text-align:right">Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:12px 8px;text-align:right;font-weight:bold">Your Sale Total</td>
            <td style="padding:12px 8px;text-align:right;font-weight:bold;color:#078930">${subtotal.toLocaleString()} ETB</td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top:24px;font-size:13px;color:#666">Log in to your seller dashboard to view and manage this order.</p>
      <p style="font-size:13px;color:#666">Thank you for selling on gebeya-B 🇪🇹</p>
    </div>
  `;
}

/**
 * Send sale notification emails to all sellers whose products were purchased.
 * Groups order items by sellerId and sends one email per seller.
 */
async function sendSellerSaleEmails(order) {
  const transport = getTransporter();
  if (!transport) {
    console.log('Seller sale emails skipped (SMTP not configured)');
    return;
  }

  // Group items by seller
  const bySeller = {};
  for (const item of order.items) {
    const sellerId = item.product?.sellerId;
    if (!sellerId) continue; // seeded/admin products — no seller to notify
    if (!bySeller[sellerId]) {
      bySeller[sellerId] = { seller: null, items: [] };
    }
    bySeller[sellerId].items.push(item);
  }

  if (Object.keys(bySeller).length === 0) return;

  // Fetch seller details
  const prisma = require('../lib/prisma');
  const sellerIds = Object.keys(bySeller).map(Number);
  const sellers = await prisma.user.findMany({
    where: { id: { in: sellerIds } },
    select: { id: true, name: true, email: true, shopName: true },
  });

  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

  await Promise.allSettled(
    sellers.map((seller) => {
      const group = bySeller[seller.id];
      if (!seller.email) return Promise.resolve();
      return transport.sendMail({
        from: `"gebeya-B" <${from}>`,
        to: seller.email,
        subject: `🎉 New Sale — Order #${order.id} — gebeya-B`,
        html: buildSellerSaleHtml({ order, seller, saleItems: group.items }),
      });
    })
  );
}

/**
 * Send password reset email with a secure link.
 */
async function sendPasswordResetEmail({ email, name, resetUrl }) {
  const transport = getTransporter();
  if (!transport) {
    console.log('Password reset email skipped (SMTP not configured)');
    return false;
  }
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  try {
    await transport.sendMail({
      from: `"gebeya-B" <${from}>`,
      to: email,
      subject: 'Reset your gebeya-B password',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#2C1810">
          <h2 style="color:#F19A0E">🔐 Password Reset</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below — the link expires in <strong>1 hour</strong>.</p>
          <div style="margin:28px 0;text-align:center">
            <a href="${resetUrl}"
              style="background:#F19A0E;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block">
              Reset Password
            </a>
          </div>
          <p style="font-size:13px;color:#666">Or paste this link in your browser:</p>
          <p style="font-size:12px;color:#888;word-break:break-all">${resetUrl}</p>
          <p style="font-size:13px;color:#666;margin-top:24px">
            If you didn't request this, ignore this email — your password won't change.
          </p>
          <div style="height:3px;background:linear-gradient(90deg,#078930 33%,#FCDD09 33% 66%,#DA121A 66%);border-radius:2px;margin-top:28px"></div>
          <p style="font-size:11px;color:#aaa;margin-top:8px">gebeya-B · Ethiopian Cultural Marketplace 🇪🇹</p>
        </div>
      `,
    });
    console.log('Password reset email sent to', email);
    return true;
  } catch (err) {
    console.error('Password reset email error:', err.message);
    return false;
  }
}

module.exports = { sendInvoiceEmail, sendSellerSaleEmails, sendPasswordResetEmail };
