import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getFirstImage } from '../utils/images';

export default function CartPage() {
  const { t } = useTranslation();
  const { cart, updateItem, removeItem, total, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => navigate('/checkout');

  if (!user) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-7xl mb-6">🛒</div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your cart awaits</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Sign in to view your cart and checkout</p>
      <Link to="/login" className="inline-flex items-center bg-primary-500 text-white px-8 py-3.5 rounded-full font-bold hover:bg-primary-600 transition-colors shadow-lg">
        {t('auth.login')}
      </Link>
    </div>
  );

  const items = cart?.items || [];

  if (!items.length) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-7xl mb-6">🛒</div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('cart.empty')}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Looks like you haven't added anything yet</p>
      <Link to="/products" className="inline-flex items-center bg-primary-500 text-white px-8 py-3.5 rounded-full font-bold hover:bg-primary-600 transition-colors shadow-lg">
        {t('cart.continue')}
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t('cart.title')}</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const img = getFirstImage(item.product.images, item.product.name);
            const placeholder = `https://placehold.co/80x80/2C1810/F19A0E?text=${item.product.name[0]}`;
            return (
              <div key={item.id} className="flex gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <Link to={`/products/${item.product.id}`} className="shrink-0">
                  <img
                    src={img}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-xl"
                    onError={(e) => { e.currentTarget.src = placeholder; e.currentTarget.onerror = null; }}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 transition-colors line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{item.product.category}</p>
                  <p className="text-primary-600 font-bold mt-1">{item.product.price.toLocaleString()} {t('common.etb')}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border dark:border-gray-600 rounded-xl overflow-hidden">
                      <button onClick={() => updateItem(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-lg font-bold">−</button>
                      <span className="w-10 text-center text-sm font-semibold dark:text-white">{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-lg font-bold">+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                      {t('cart.remove')}
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-gray-900 dark:text-white">{(item.product.price * item.quantity).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{t('common.etb')}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>{total.toLocaleString()} {t('common.etb')}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
            </div>
            <div className="border-t dark:border-gray-700 mt-4 pt-4 flex justify-between font-black text-gray-900 dark:text-white text-lg">
              <span>{t('cart.total')}</span>
              <span className="text-primary-600">{total.toLocaleString()} {t('common.etb')}</span>
            </div>
            <button onClick={handleCheckout}
              className="w-full mt-5 bg-primary-500 hover:bg-primary-600 text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
              🛍️ {t('cart.checkout')}
            </button>
            <Link to="/products" className="block text-center mt-3 text-sm text-gray-500 hover:text-primary-600 transition-colors">
              ← {t('cart.continue')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
