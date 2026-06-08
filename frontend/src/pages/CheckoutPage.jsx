import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

// ── Bank transfer modal ────────────────────────────────────────────
function BankModal({ bank, onClose }) {
  const [copied, setCopied] = useState(false);

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative text-white text-center py-6 px-5"
            style={{ background: 'linear-gradient(135deg, #2C1810 0%, #1a0e06 60%, #078930 100%)' }}>
            <div className="absolute inset-0 pattern-tibeb opacity-20" />
            <div className="relative">
              <div className="w-14 h-14 mx-auto mb-3 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                {bank.icon}
              </div>
              <h2 className="font-black text-lg">{bank.label}</h2>
              <p className="text-white/60 text-xs mt-0.5">{bank.sub}</p>
            </div>
            <button onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              ✕
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Account number */}
            {bank.account ? (
              <>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account Number</p>
                  <div className="flex items-center gap-2 bg-[#F5F0E8] rounded-2xl px-4 py-3">
                    <p className="flex-1 font-mono font-black text-[#2C1810] text-lg tracking-widest">{bank.account}</p>
                    <button onClick={() => copy(bank.account)}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        copied ? 'bg-green-500 text-white' : 'bg-[#F19A0E] text-white hover:bg-[#d97b08] active:scale-95'
                      }`}>
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {bank.name && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account Name</p>
                    <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center justify-between">
                      <p className="font-semibold text-[#2C1810]">{bank.name}</p>
                      <button onClick={() => copy(bank.name)}
                        className="text-xs text-[#F19A0E] font-bold hover:underline ml-3">Copy</button>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-blue-500 text-lg shrink-0">ℹ️</span>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Transfer the exact amount and send a screenshot to confirm your order. Your order will be processed after verification.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-4xl mb-3">🚧</p>
                <p className="font-bold text-gray-700">Not available yet</p>
                <p className="text-sm text-gray-400 mt-1">Use Chapa or another bank for now.</p>
              </div>
            )}

            <button onClick={onClose}
              className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-2xl font-bold text-sm hover:border-[#2C1810] hover:text-[#2C1810] transition-colors">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main CheckoutPage ──────────────────────────────────────────────
export default function CheckoutPage() {
  const cartCtx = useCart();
  const authCtx = useAuth();
  const [loading, setLoading] = useState(false);
  const [payConfig, setPayConfig] = useState({});
  const [selectedBank, setSelectedBank] = useState(null);
  const [payMethod, setPayMethod] = useState('chapa'); // 'chapa' | 'bank'

  const user = authCtx?.user;
  const authLoading = authCtx?.loading;
  const cart = cartCtx?.cart;
  const items = Array.isArray(cart?.items) ? cart.items : [];
  const subtotal = typeof cartCtx?.subtotal === 'number' ? cartCtx.subtotal : 0;
  const tax      = typeof cartCtx?.tax === 'number' ? cartCtx.tax : 0;
  const total    = typeof cartCtx?.total === 'number' ? cartCtx.total : 0;

  // Fetch payment accounts from backend
  useEffect(() => {
    api.get('/config/payment').then(({ data }) => setPayConfig(data)).catch(() => {});
  }, []);

  const BANKS = [
    {
      key: 'cbe',
      label: 'CBE Birr',
      sub: 'Commercial Bank of Ethiopia',
      icon: '🏦',
      logo: '/images/cbe.png',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      account: payConfig.payment_cbe_account || '',
      name: payConfig.payment_cbe_name || '',
    },
    {
      key: 'telebirr',
      label: 'Telebirr',
      sub: 'Ethiopian mobile money',
      icon: '📱',
      logo: '/images/telebirr.png',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      account: payConfig.payment_telebirr_account || '',
      name: payConfig.payment_telebirr_name || '',
    },
    {
      key: 'boa',
      label: 'Bank of Abyssinia',
      sub: 'BOA mobile banking',
      icon: '💳',
      logo: '/images/boa.png',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      account: payConfig.payment_boa_account || '',
      name: payConfig.payment_boa_name || '',
    },
    {
      key: 'awash',
      label: 'Awash Bank',
      sub: 'Awash mobile banking',
      icon: '🏧',
      logo: '/images/awash.png',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      account: payConfig.payment_awash_account || '',
      name: payConfig.payment_awash_name || '',
    },
  ];

  const handleChapaPayment = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments/initialize');
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.error('No checkout URL received');
        setLoading(false);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Payment initialization failed';
      toast.error(typeof msg === 'string' ? msg : 'Payment initialization failed');
      setLoading(false);
    }
  };

  if (authLoading) return null;

  if (!user) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-6xl mb-4">🔒</p>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to checkout</h2>
      <Link to="/login" className="bg-[#F19A0E] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#d97b08] transition-colors">Login</Link>
    </div>
  );

  if (items.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-6xl mb-4">🛒</p>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
      <Link to="/products" className="bg-[#F19A0E] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#d97b08] transition-colors">Continue Shopping</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-[#2C1810]">Checkout</h1>
        <p className="text-gray-500 mt-1 text-sm">Choose your payment method</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 sm:gap-8">
        <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">

          {/* ── Payment method toggle ── */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPayMethod('chapa')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                payMethod === 'chapa'
                  ? 'border-[#2C1810] bg-[#2C1810] text-white shadow-lg'
                  : 'border-gray-200 bg-white text-[#2C1810] hover:border-[#2C1810]/40'
              }`}>
              <span className="text-2xl">🇪🇹</span>
              <span>Pay via Chapa</span>
              <span className={`text-[10px] font-normal ${payMethod === 'chapa' ? 'text-white/70' : 'text-gray-400'}`}>
                Telebirr · CBE · BOA · Awash
              </span>
            </button>
            <button
              onClick={() => setPayMethod('bank')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                payMethod === 'bank'
                  ? 'border-[#F19A0E] bg-[#FEF3E2] text-[#2C1810] shadow-lg'
                  : 'border-gray-200 bg-white text-[#2C1810] hover:border-[#F19A0E]/40'
              }`}>
              <span className="text-2xl">🏦</span>
              <span>Direct Bank Transfer</span>
              <span className={`text-[10px] font-normal ${payMethod === 'bank' ? 'text-[#2C1810]/60' : 'text-gray-400'}`}>
                CBE · Telebirr · BOA · Awash
              </span>
            </button>
          </div>

          {/* ── Chapa section ── */}
          <AnimatePresence mode="wait">
            {payMethod === 'chapa' && (
              <motion.div key="chapa"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="space-y-4">
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2C1810] rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-xl sm:text-2xl">🇪🇹</span>
                    </div>
                    <div>
                      <h2 className="font-black text-[#2C1810] text-sm sm:text-base">Pay with Chapa</h2>
                      <p className="text-xs text-gray-400">Ethiopia's trusted payment gateway</p>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Accepted via Chapa</p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {BANKS.map(({ logo, label, sub, bg, icon }) => (
                      <div key={label} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 ${bg} rounded-xl border border-gray-100`}>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden shrink-0 bg-white flex items-center justify-center shadow-sm">
                          <img src={logo} alt={label} className="w-full h-full object-contain p-1"
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'block'; }} />
                          <span style={{ display: 'none' }} className="text-lg">{icon}</span>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-[#2C1810] leading-tight">{label}</p>
                          <p className="text-[9px] sm:text-[10px] text-gray-400 leading-tight">{sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 bg-[#FEF3E2] rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3">
                    <span className="text-base sm:text-lg shrink-0">ℹ️</span>
                    <p className="text-xs text-[#2C1810]/70 leading-relaxed">
                      You will be redirected to Chapa's secure page to complete payment.
                    </p>
                  </div>
                </div>

                <button onClick={handleChapaPayment} disabled={loading}
                  className="w-full bg-[#2C1810] hover:bg-[#1a0e06] active:bg-black text-white py-4 rounded-2xl font-black text-base sm:text-lg transition-all disabled:opacity-60 flex items-center justify-center gap-3 active:scale-[0.98]">
                  {loading
                    ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Redirecting...</span></>
                    : <><span>🇪🇹</span><span>Pay {total.toLocaleString()} ETB via Chapa</span></>
                  }
                </button>
                <p className="text-center text-xs text-gray-400">Secured by Chapa · Telebirr · CBE Birr · Awash · BOA</p>
              </motion.div>
            )}

            {/* ── Bank transfer section ── */}
            {payMethod === 'bank' && (
              <motion.div key="bank"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="space-y-4">
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                  <h2 className="font-black text-[#2C1810] mb-1">Direct Bank Transfer</h2>
                  <p className="text-xs text-gray-400 mb-5">Click a bank to see the account number, then transfer the exact amount.</p>

                  <div className="grid grid-cols-2 gap-3">
                    {BANKS.map((bank) => (
                      <button
                        key={bank.key}
                        onClick={() => setSelectedBank(bank)}
                        className={`flex items-center gap-3 p-3 sm:p-4 ${bank.bg} rounded-2xl border-2 ${bank.border} hover:shadow-md active:scale-[0.97] transition-all text-left group`}
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white flex items-center justify-center shadow-sm">
                          <img src={bank.logo} alt={bank.label} className="w-full h-full object-contain p-1"
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'block'; }} />
                          <span style={{ display: 'none' }} className="text-xl">{bank.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-[#2C1810] leading-tight truncate">{bank.label}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {bank.account ? 'Tap to view →' : 'Not available'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                    <span className="text-amber-500 text-lg shrink-0">⚠️</span>
                    <div className="text-xs text-amber-800 leading-relaxed">
                      <p className="font-bold mb-1">After transferring:</p>
                      <p>Send proof of payment (screenshot) to confirm your order. Orders are processed after manual verification.</p>
                    </div>
                  </div>
                </div>

                {/* Amount reminder */}
                <div className="bg-[#2C1810] rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-xs">Amount to transfer</p>
                    <p className="text-white font-black text-2xl mt-0.5">{total.toLocaleString()} <span className="text-sm font-normal text-white/60">ETB</span></p>
                  </div>
                  <span className="text-4xl">💸</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Order summary ── */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden lg:sticky lg:top-24">
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#078930 33%,#FCDD09 33% 66%,#DA121A 66%)' }} />
            <div className="p-4 sm:p-5">
              <h2 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">
                Order Summary ({items.length} items)
              </h2>
              <div className="space-y-3 max-h-56 sm:max-h-64 overflow-y-auto mb-4 pr-1">
                {items.map((item, idx) => {
                  const name = item?.product?.name || 'Product';
                  const price = Number(item?.product?.price) || 0;
                  const qty = Number(item?.quantity) || 1;
                  return (
                    <div key={item?.id || idx} className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F5F0E8] rounded-lg shrink-0 flex items-center justify-center text-[#2C1810] font-bold text-base sm:text-lg">
                        {name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{name}</p>
                        <p className="text-xs text-gray-400">×{qty}</p>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900 shrink-0">{(price * qty).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-3 sm:pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{subtotal.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span><span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (15%)</span><span>{tax.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between font-black text-gray-900 text-sm sm:text-base pt-2 border-t">
                  <span>Total</span>
                  <span className="text-[#F19A0E]">{total.toLocaleString()} ETB</span>
                </div>
                <p className="text-xs text-gray-400 text-right">VAT included</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank account modal */}
      {selectedBank && (
        <BankModal bank={selectedBank} onClose={() => setSelectedBank(null)} />
      )}
    </div>
  );
}
