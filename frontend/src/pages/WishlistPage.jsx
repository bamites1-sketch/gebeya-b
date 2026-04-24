import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function WishlistPage() {
  const { t } = useTranslation();
  const { wishlist, toggle } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  if (!user) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-7xl mb-6">❤️</div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Save your favorites</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Sign in to create and view your wishlist</p>
      <Link to="/login" className="inline-flex items-center bg-primary-500 text-white px-8 py-3.5 rounded-full font-bold hover:bg-primary-600 transition-colors shadow-lg">
        {t('auth.login')}
      </Link>
    </div>
  );

  const items = wishlist?.items || [];

  if (!items.length) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="text-7xl mb-6">🤍</div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('wishlist.empty')}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Browse products and tap ♡ to save them here</p>
      <Link to="/products" className="inline-flex items-center bg-primary-500 text-white px-8 py-3.5 rounded-full font-bold hover:bg-primary-600 transition-colors shadow-lg">
        Browse Products
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t('wishlist.title')}</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(({ product }) => {
          const images = (() => { try { return JSON.parse(product.images); } catch { return []; } })();
          const img = images[0] || `https://placehold.co/400x300/f19a0e/ffffff?text=${product.name[0]}`;
          return (
            <div key={product.id} className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <Link to={`/products/${product.id}`} className="block relative overflow-hidden aspect-[4/3]">
                <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <button onClick={(e) => { e.preventDefault(); toggle(product.id); }}
                  className="absolute top-3 right-3 w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors hover:scale-110">
                  ♥
                </button>
              </Link>
              <div className="p-4 flex flex-col flex-1">
                <Link to={`/products/${product.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 transition-colors line-clamp-1">
                  {product.name}
                </Link>
                <p className="text-xs text-gray-400 capitalize mt-0.5">{product.category}</p>
                <div className="flex items-center justify-between mt-auto pt-3">
                  <span className="font-black text-primary-600">{product.price.toLocaleString()} <span className="text-xs font-normal text-gray-400">{t('common.etb')}</span></span>
                  <button onClick={() => addToCart(product.id)}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors">
                    🛒 Add
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
