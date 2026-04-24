import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getFirstImage } from '../utils/images';

// ── Payment method config ─────────────────────────────────────────
const METHODS = [
  { id: 'card',     icon: '💳', label: 'Credit / Debit Card',  sub: 'Visa · Mastercard · Amex' },
  { id: 'telebirr', icon: '📱', label: 'Telebirr',             sub: 'Ethiopian mobile money' },
  { id: 'cbe',      icon: '🏦', label: 'CBE Birr',             sub: 'Commercial Bank of Ethiopia' },
  { id: 'cod',      icon: '💵', label: 'Cash on Delivery',     sub: 'Pay when you receive' },
];

// ── Helpers ───────────────────────────────────────────────────────
const fmtCard = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const fmtExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function CheckoutPage() {
  const { t } = useTranslation();
  const { cart, total, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState('card');
  const [step, setStep]     = useState('form');   // form | processing | success
  const [errors, setErrors] = useState({});
  const [order, setOrder]   = useState(null);

  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [phone, setPhone]   = useState('');

  const items = cart?.items || [];

  // ── Guards ────────────────────────────────────────────────────
  if (!user) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-6xl mb-4">🔒</p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sign in to checkout</h2>
      <Link to="/login" className="bg-primary-500 text-white px-8 py-3.5 rounded-full font-bold hover:bg-primary-600 transition-colors">
        {t('auth.login')}
      </Link>
    </div>
  );

  if (!items.length) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-6xl mb-4">🛒</p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cart.empty')}</h2>
      <Link to="/products" className="bg-primary-500 text-white px-8 py-3.5 rounded-full font-bold hover:bg-primary-600 transition-colors">
        {t('cart.continue')}
      </Link>
    </div>
  );

  // ── Validation ────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (method === 'card') {
      if (card.number.replace(/\s/g, '').length < 16) e.number = 'Enter a 16-digit card number';
      if (!card.expiry || card.expiry.length < 5)     e.expiry = 'Enter expiry date (MM/YY)';
      if (card.cvv.length < 3)                        e.cvv    = 'Enter 3-digit CVV';
      if (!card.name.trim())                          e.name   = 'Enter name on card';
    }
    if (method === 'telebirr' || method === 'cbe') {
      if (phone.replace(/\D/g, '').length < 9) e.phone = 'Enter a valid phone number';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  // ── Submit ────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!validate()) return;
    setStep('processing');

    // Simulate 2-second processing delay
    await new Promise((r) => setTimeout(r, 2000));

    try {
      // Create real order in DB
      const { data } = await api.post('/orders');
      await fetchCart();

      const txnId  = `TXN-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
      const orderId = `GEB-${data.id}-${Date.now().toString().slice(-4)}`;

      setOrder({ ...data, txnId, orderId, paymentMethod: method });
      setStep('success');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
      setStep('form');
    }
  };

  // ── STEP: Processing ──────────────────────────────────────────
  if (step === 'processing') return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-[#F19A0E]/20" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#F19A0E] animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">
          {METHODS.find(m => m.id === method)?.icon}
        </span>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-gray-900 dark:text-white">Processing Payment…</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please wait, do not close this page</p>
      </div>
    </div>
  );

  // ── STEP: Success ─────────────────────────────────────────────
  if (step === 'success' && order) return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-4 py-12"
    >
      {/* Success header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5"
        >
          <span className="text-5xl">✅</span>
        </motion.div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-500 dark:text-gray-400">Thank you for your order, {user.name.split(' ')[0]}!</p>
      </div>

      {/* Order details card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-6">
        {/* Ethiopian flag stripe */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#078930 33%,#FCDD09 33% 66%,#DA121A 66%)' }} />

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Order Number</p>
              <p className="font-black text-[#F19A0E] font-mono">#{order.orderId}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Transaction ID</p>
              <p className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate">{order.txnId}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Payment Method</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {METHODS.find(m => m.id === order.paymentMethod)?.icon}{' '}
                {METHODS.find(m => m.id === order.paymentMethod)?.label}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Total Paid</p>
              <p className="font-black text-xl text-[#F19A0E]">{order.totalPrice?.toLocaleString()} ETB</p>
            </div>
          </div>

          {/* Items */}
          <div className="border-t dark:border-gray-700 pt-4">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
              📦 Items Ordered ({order.items?.length})
            </p>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <img
                    src={getFirstImage(item.product?.images, item.product?.name)}
                    alt={item.product?.name}
                    className="w-10 h-10 object-cover rounded-lg shrink-0"
                    onError={(e) => { e.currentTarget.src = `https://placehold.co/40x40/2C1810/F19A0E?text=${item.product?.name?.[0]}`; e.currentTarget.onerror = null; }}
                  />
                  <span className="flex-1 text-gray-700 dark:text-gray-300 truncate">{item.product?.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">×{item.quantity}</span>
                  <span className="font-semibold text-gray-900 dark:text-white shrink-0">
                    {(item.price * item.quantity).toLocaleString()} ETB
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Simulated email confirmation */}
          <div className="bg-[#FEF3E2] dark:bg-[#2C1810]/40 rounded-xl p-3 flex items-center gap-3 text-sm">
            <span className="text-xl">📧</span>
            <p className="text-gray-700 dark:text-gray-300">
              Confirmation email sent to <span className="font-semibold text-[#F19A0E]">{user.email}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/" className="flex-1 text-center bg-[#F19A0E] hover:bg-[#d97b08] text-white py-3.5 rounded-xl font-bold transition-colors">
          🏠 Back to Home
        </Link>
        <Link to="/profile" className="flex-1 text-center border-2 border-[#F19A0E] text-[#F19A0E] py-3.5 rounded-xl font-bold hover:bg-[#FEF3E2] transition-colors">
          📦 View My Orders
        </Link>
      </div>
    </motion.div>
  );

  // ── STEP: Form ────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Checkout</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Complete your order securely</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">

        {/* ── Left: Payment form ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Payment method selector */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Payment Method</h2>
            <div className="grid grid-cols-2 gap-3">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setMethod(m.id); setErrors({}); }}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                    method === m.id
                      ? 'border-[#F19A0E] bg-[#FEF3E2] dark:bg-[#2C1810]/40'
                      : 'border-gray-200 dark:border-gray-600 hover:border-[#F19A0E]/50'
                  }`}
                >
                  <span className="text-2xl">{m.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{m.label}</p>
                    <p className="text-[10px] text-gray-400 leading-tight truncate">{m.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment details form */}
          <AnimatePresence mode="wait">
            <motion.div
              key={method}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm"
            >
              {/* Card form */}
              {method === 'card' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-bold text-gray-900 dark:text-white">Card Details</h2>
                    <div className="flex gap-1.5 text-xl">💳 🔒</div>
                  </div>

                  {/* Test mode banner */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-bold mb-1">🧪 TEST MODE — Use any fake details:</p>
                    <p>Card: <span className="font-mono">4111 1111 1111 1111</span></p>
                    <p>Expiry: <span className="font-mono">12/28</span> · CVV: <span className="font-mono">123</span></p>
                  </div>

                  <Field label="Card Number" error={errors.number}>
                    <input
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: fmtCard(e.target.value) })}
                      placeholder="4111 1111 1111 1111"
                      maxLength={19}
                      className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl text-sm font-mono dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E]"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Expiry Date" error={errors.expiry}>
                      <input
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: fmtExpiry(e.target.value) })}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl text-sm font-mono dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E]"
                      />
                    </Field>
                    <Field label="CVV" error={errors.cvv}>
                      <input
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl text-sm font-mono dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E]"
                      />
                    </Field>
                  </div>

                  <Field label="Name on Card" error={errors.name}>
                    <input
                      value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value })}
                      placeholder="Abebe Kebede"
                      className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E]"
                    />
                  </Field>
                </div>
              )}

              {/* Telebirr / CBE form */}
              {(method === 'telebirr' || method === 'cbe') && (
                <div className="space-y-4">
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    {method === 'telebirr' ? '📱 Telebirr' : '🏦 CBE Birr'} Details
                  </h2>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-bold mb-1">🧪 TEST MODE — Use any phone number:</p>
                    <p>Phone: <span className="font-mono">0911 000 000</span></p>
                  </div>
                  <Field label="Phone Number" error={errors.phone}>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09XX XXX XXX"
                      className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl text-sm font-mono dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E]"
                    />
                  </Field>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    You will receive a payment prompt on your {method === 'telebirr' ? 'Telebirr' : 'CBE Birr'} app.
                  </p>
                </div>
              )}

              {/* Cash on Delivery */}
              {method === 'cod' && (
                <div className="space-y-3">
                  <h2 className="font-bold text-gray-900 dark:text-white">💵 Cash on Delivery</h2>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-sm text-green-700 dark:text-green-300 space-y-1">
                    <p className="font-bold">✅ No payment needed now</p>
                    <p>Pay in cash when your order arrives.</p>
                    <p>Delivery: 2–5 business days within Addis Ababa.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Pay button */}
          <button
            onClick={handlePay}
            className="w-full bg-[#F19A0E] hover:bg-[#d97b08] text-white py-4 rounded-2xl font-black text-lg transition-all shadow-lg shadow-[#F19A0E]/30 hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center gap-3"
          >
            <span>🔒</span>
            {method === 'cod' ? 'Place Order' : `Pay ${total.toLocaleString()} ETB`}
          </button>

          <p className="text-center text-xs text-gray-400">
            🔒 Secured · 🇪🇹 gebeya-B · All transactions are simulated for demo
          </p>
        </div>

        {/* ── Right: Order summary ── */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden sticky top-24">
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#078930 33%,#FCDD09 33% 66%,#DA121A 66%)' }} />
            <div className="p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">
                Order Summary <span className="text-gray-400 font-normal text-sm">({items.length} items)</span>
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide mb-4">
                {items.map((item) => {
                  const img = getFirstImage(item.product.images, item.product.name);
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={img}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg shrink-0"
                        onError={(e) => { e.currentTarget.src = `https://placehold.co/48x48/2C1810/F19A0E?text=${item.product.name[0]}`; e.currentTarget.onerror = null; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-400">×{item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                        {(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t dark:border-gray-700 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{total.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-black text-gray-900 dark:text-white text-base pt-2 border-t dark:border-gray-700">
                  <span>Total</span>
                  <span className="text-[#F19A0E]">{total.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
