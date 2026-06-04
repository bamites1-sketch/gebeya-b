import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getFirstImage } from '../utils/images';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { cart, total } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const items = cart?.items || [];

  if (!user) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-6xl mb-4">🔒</p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sign in to checkout</h2>
      <Link to="/login" className="bg-[#F19A0E] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#d97b08] transition-colors">
        {t('auth.login')}
      </Link>
    </div>
  );

  if (!items.length) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-6xl mb-4">🛒</p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cart.empty')}</h2>
      <Link to="/products" className="bg-[#F19A0E] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#d97b08] transition-colors">
        {t('cart.continue')}
      </Link>
    </div>
  );

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments/initialize');
      window.location.href = data.checkout_url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment initialization failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-[#2C1810] dark:text-white">Checkout</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Complete your order securely via Chapa 🇪🇹</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">

        <div className="lg:col-span-3 space-y-6">

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-[#2C1810] rounded-xl flex items-center justify-center">
                <span className="text-2xl">🇪🇹</span>
              </div>
              <div>
                <h2 className="font-black text-[#2C1810] dark:text-white">Pay with Chapa</h2>
                <p className="text-xs text-gray-400">Ethiopia's trusted payment gateway</p>
              </div>
            </div>

            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Accepted Payment Methods</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '📱', label: 'Telebirr', sub: 'Ethiopian mobile money' },
                { icon: '🏦', label: 'CBE Birr', sub: 'Commercial Bank of Ethiopia' },
                { icon: '🏧', label: 'Awash Bank', sub: 'Awash mobile banking' },
                { icon: '💳', label: 'Bank of Abyssinia', sub: 'BOA mobile banking' },
              ].map(({ icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-[#F5F0E8] dark:bg-gray-700/50 rounded-xl">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-sm font-bold text-[#2C1810] dark:text-white leading-tight">{label}</p>
                    <p className="text-[10px] text-gray-400 leading-tight">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 bg-[#FEF3E2] rounded-xl p-4 flex items-start gap-3">
              <span className="text-xl shrink-0">ℹ️</span>
              <p className="text-xs text-[#2C1810]/70 leading-relaxed">
                You will be redirected to Chapa's secure payment page. Choose your preferred Ethiopian payment method and complete the payment there.
              </p>
            </div>
          </div>

          <button onClick={handlePay} disabled={loading}
            className="w-full bg-[#2C1810] hover:bg-[#1a0e06] text-white py-4 rounded-2xl font-black text-lg transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 flex items-center justify-center gap-3">
            {loading
              ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Redirecting to Chapa...</>
              : <><span>🇪🇹</span> Pay {total.toLocaleString()} ETB via Chapa</>
            }
          </button>

          <p className="text-center text-xs text-gray-400">
            🔒 Secured by Chapa · Telebirr · CBE Birr · Awash · BOA
          </p>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden sticky top-24">
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#078930 33%,#FCDD09 33% 66%,#DA121A 66%)' }} />
            <div className="p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">
                Order Summary <span className="text-gray-400 font-normal text-sm">({items.length} items)</span>
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={getFirstImage(item.product.images, item.product.name)} alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg shrink-0"
                      onError={(e) => { e.currentTarget.src = `https://placehold.co/48x48/2C1810/F19A0E?text=${item.product.name[0]}`; e.currentTarget.onerror = null; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                      {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
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
