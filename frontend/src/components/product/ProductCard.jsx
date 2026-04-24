import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { MadeInEthiopiaBadge } from '../ui/Logo';
import { getFirstImage } from '../../utils/images';

export default function ProductCard({ product }) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { toggle, isInWishlist } = useWishlist();

  const img = getFirstImage(product.images, product.name);
  const placeholder = `https://placehold.co/400x300/2C1810/F19A0E?text=${encodeURIComponent(product.name[0])}`;
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col border border-transparent hover:border-[#F19A0E]/40">
      {/* Image */}
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden aspect-[4/3]">
        <img src={img} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = placeholder; e.currentTarget.onerror = null; }}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 ${inWishlist ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-gray-800/90 text-gray-600'}`}
          aria-label="Toggle wishlist">
          {inWishlist ? '♥' : '♡'}
        </button>

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
              {t('product.out_of_stock')}
            </span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute bottom-3 left-3">
          <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium capitalize">
            {t(`categories.${product.category}`) || product.category}
          </span>
        </div>

        {/* Made in Ethiopia badge */}
        <div className="absolute top-3 left-3">
          <MadeInEthiopiaBadge />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600 transition-colors text-sm leading-snug">
            {product.name}
          </h3>
        </Link>
        {product.region && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 capitalize">
            📍 {t(`regions.${product.region}`) || product.region}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3">
          <div>
            <span className="text-lg font-black text-primary-600">{product.price.toLocaleString()}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{t('common.etb')}</span>
          </div>
          <button
            onClick={() => addToCart(product.id)}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            🛒 {t('product.add_to_cart')}
          </button>
        </div>
      </div>
    </div>
  );
}
