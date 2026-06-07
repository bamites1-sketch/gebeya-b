import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductGrid from '../components/product/ProductGrid';
import { Skeleton } from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import VerifiedSellerBadge from '../components/ui/VerifiedSellerBadge';
import { resolveImages } from '../utils/images';
import ProductReviews from '../components/product/ProductReviews';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    Promise.all([api.get(`/products/${id}`), api.get(`/products/${id}/related`)])
      .then(([p, r]) => { setProduct(p.data); setRelated(r.data); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await addToCart(product.id, qty);
    setAddingToCart(false);
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="grid md:grid-cols-2 gap-8 sm:gap-10">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-28 sm:h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20 sm:py-24 px-4">
      <p className="text-5xl mb-4">🔍</p>
      <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Product not found</p>
      <Link to="/products" className="mt-4 inline-block text-primary-600 hover:underline">← Back to products</Link>
    </div>
  );

  const images = resolveImages(product.images);
  const placeholder = `https://placehold.co/600x500/2C1810/F19A0E?text=${encodeURIComponent(product.name)}`;
  const img = images[activeImg] || placeholder;
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 overflow-x-auto scrollbar-hide whitespace-nowrap pb-1">
        <Link to="/" className="hover:text-primary-600 transition-colors shrink-0">Home</Link>
        <span>›</span>
        <Link to="/products" className="hover:text-primary-600 transition-colors shrink-0">{t('nav.products')}</Link>
        <span>›</span>
        <span className="text-gray-900 dark:text-white font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 sm:gap-10 mb-12 sm:mb-16">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg">
            <img src={img} alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.src = placeholder; e.currentTarget.onerror = null; }} />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-red-500 text-white px-5 py-2 rounded-full font-bold text-sm">{t('product.out_of_stock')}</span>
              </div>
            )}
            <button onClick={() => toggle(product.id)}
              className={`absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-lg text-xl transition-all hover:scale-110 active:scale-95 ${inWishlist ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-gray-800/90 text-gray-600'}`}>
              {inWishlist ? '♥' : '♡'}
            </button>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={src} alt="" className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = placeholder; e.currentTarget.onerror = null; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge color="primary">{t(`categories.${product.category}`) || product.category}</Badge>
            {product.region && <Badge color="gray">📍 {t(`regions.${product.region}`) || product.region}</Badge>}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">{product.name}</h1>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-primary-600">{product.price.toLocaleString()}</span>
            <span className="text-base sm:text-lg text-gray-500 dark:text-gray-400">{t('common.etb')}</span>
          </div>

          {/* Stock + views */}
          <div className="flex items-center flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {product.stock > 10 ? t('product.in_stock') : product.stock > 0 ? `Only ${product.stock} left` : t('product.out_of_stock')}
              </span>
            </div>
            {product.views > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                {product.views.toLocaleString()} views
              </span>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed border-t dark:border-gray-700 pt-4">
            {product.description}
          </p>

          {product.seller && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>🛍️</span>
              <span>Sold by <span className="font-semibold text-gray-900 dark:text-white">{product.seller.shopName || product.seller.name}</span></span>
              {product.seller.verified && <VerifiedSellerBadge />}
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 shrink-0">{t('product.quantity')}:</span>
            <div className="flex items-center border-2 dark:border-gray-600 rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xl font-bold text-gray-700 dark:text-gray-200 active:bg-gray-200">−</button>
              <span className="w-10 sm:w-12 text-center font-bold text-gray-900 dark:text-white text-sm sm:text-base">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
                className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xl font-bold text-gray-700 dark:text-gray-200 active:bg-gray-200">+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={handleAddToCart} disabled={product.stock === 0 || addingToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 active:scale-[0.98]">
              {addingToCart
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : '🛒'}
              {addingToCart ? 'Adding...' : t('product.add_to_cart')}
            </button>
            <button onClick={() => toggle(product.id)}
              className={`min-w-[48px] sm:min-w-[56px] h-[52px] sm:h-14 rounded-2xl border-2 flex items-center justify-center text-xl sm:text-2xl transition-all hover:scale-105 active:scale-95 ${inWishlist ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-gray-200 dark:border-gray-600 hover:border-primary-500'}`}>
              {inWishlist ? '♥' : '♡'}
            </button>
          </div>

          {/* Trust row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 border-t dark:border-gray-700">
            {[['🚚', 'Free Shipping'], ['↩️', '7-Day Returns'], ['🔒', 'Secure Pay']].map(([icon, label]) => (
              <div key={label} className="flex flex-col items-center text-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <span className="text-lg sm:text-xl mb-0.5 sm:mb-1">{icon}</span>
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('product.related')}</h2>
            <Link to={`/products?category=${product.category}`} className="text-sm text-primary-600 hover:underline shrink-0 ml-4">View all →</Link>
          </div>
          <ProductGrid products={related} loading={false} />
        </section>
      )}

      {/* Reviews */}
      <ProductReviews productId={parseInt(id)} />
    </div>
  );
}
