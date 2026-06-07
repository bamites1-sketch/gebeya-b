import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const cartCtx = useCart();
  const authCtx = useAuth();
  const [loading, setLoading] = useState(false);

  const user = authCtx?.user;
  const cart = cartCtx?.cart;
  const items = Array.isArray(cart?.items) ? cart.items : [];
  const total = typeof cartCtx?.total === 'number' ? cartCtx.total : 0;

  const handlePay = async () => {
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

  if (!user) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-6xl mb-4">🔒</p>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to checkout</h2>
      <Link to="/login" className="bg-[#F19A0E] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#d97b08] transition-colors">
        Login
      </Link>
    </div>
  );

  if (items.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-6xl mb-4">🛒</p>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
      <Link to="/products" className="bg-[#F19A0E] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#d97b08] transition-colors">
        Continue Shopping
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-[#2C1810]">Checkout</h1>
        <p className="text-gray-500 mt-1 text-sm">Complete your order securely via Chapa</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 sm:gap-8">

        <div className="lg:col-span-3 space-y-5 sm:space-y-6 order-2 lg:order-1">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2C1810] rounded-xl flex items-center justify-center shrink-0">
                <span className="text-xl sm:text-2xl">🇪🇹</span>
              </div>
              <div>
                <h2 className="font-black text-[#2C1810] text-sm sm:text-base">Pay with Chapa</h2>
                <p className="text-xs text-gray-400">Ethiopia's trusted payment gateway</p>
              </div>
            </div>

            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Accepted Payment Methods</p>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {[
                { logo: '/images/telebirr.png', label: 'Telebirr',          sub: 'Ethiopian mobile money',      bg: 'bg-blue-50',   fallback: '📱' },
                { logo: '/images/cbe.png',      label: 'CBE Birr',          sub: 'Commercial Bank of Ethiopia', bg: 'bg-yellow-50', fallback: '🏦' },
                { logo: '/images/boa.png',      label: 'Bank of Abyssinia', sub: 'BOA mobile banking',          bg: 'bg-amber-50',  fallback: '💳' },
                { logo: '/images/awash.png',    label: 'Awash Bank',        sub: 'Awash mobile banking',        bg: 'bg-orange-50', fallback: '🏧' },
              ].map(({ logo, label, sub, bg, fallback }) => (
                <div key={label} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 ${bg} rounded-xl border border-gray-100`}>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden shrink-0 bg-white flex items-center justify-center shadow-sm">
                    <img src={logo} alt={label} className="w-full h-full object-contain p-1"
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'block'; }} />
                    <span style={{ display: 'none' }} className="text-lg">{fallback}</span>
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

          <button onClick={handlePay} disabled={loading}
            className="w-full bg-[#2C1810] hover:bg-[#1a0e06] active:bg-black text-white py-4 rounded-2xl font-black text-base sm:text-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 sm:gap-3 active:scale-[0.98]">
            {loading
              ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Redirecting...</span></>
              : <><span>🇪🇹</span><span>Pay {total.toLocaleString()} ETB via Chapa</span></>
            }
          </button>
          <p className="text-center text-xs text-gray-400">Secured by Chapa · Telebirr · CBE Birr · Awash · BOA</p>
        </div>

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
                  <span>Subtotal</span><span>{total.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span><span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-black text-gray-900 text-sm sm:text-base pt-2 border-t">
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
