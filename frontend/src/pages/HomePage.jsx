import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { getFirstImage } from '../utils/images';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

// ── Animation helpers ─────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

function Section({ children, className = '' }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

// ── Category data ─────────────────────────────────────────────────
const CATS = [
  { key: 'clothing',    label: 'Clothing',     img: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=200&q=80',  icon: '👗' },
  { key: 'crafts',      label: 'Crafts',       img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&q=80',  icon: '🏺' },
  { key: 'food',        label: 'Food',         img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&q=80',  icon: '☕' },
  { key: 'music',       label: 'Music',        img: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200&q=80',  icon: '🎵' },
  { key: 'accessories', label: 'Jewelry',      img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&q=80',  icon: '💍' },
  { key: 'art',         label: 'Art',          img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&q=80',  icon: '🎨' },
  { key: 'electronics', label: 'Electronics',  img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80',  icon: '📱' },
];

// ── Animated counter ──────────────────────────────────────────────
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const step = Math.ceil(to / 40);
    const t = setInterval(() => {
      n += step;
      if (n >= to) { setVal(to); clearInterval(t); }
      else setVal(n);
    }, 35);
    return () => clearInterval(t);
  }, [inView, to]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Home product card ─────────────────────────────────────────────
function HomeProductCard({ product }) {
  const { addToCart }         = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const img       = getFirstImage(product.images, product.name);
  const inWishlist = isInWishlist(product.id);

  return (
    <motion.div variants={fadeUp}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col border border-transparent hover:border-[#F19A0E]/30">
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden aspect-[4/3]">
        <img src={img} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = `https://placehold.co/400x300/2C1810/F19A0E?text=${product.name[0]}`; e.currentTarget.onerror = null; }} />
        {/* Wishlist */}
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
            inWishlist ? 'bg-red-500 text-white' : 'bg-white/95 text-gray-500 hover:text-red-500 hover:scale-110'
          }`}>
          <svg width="13" height="13" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold">Out of Stock</span>
          </div>
        )}
      </Link>
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-[#2C1810] text-xs sm:text-sm leading-snug hover:text-[#F19A0E] transition-colors line-clamp-1">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between mt-auto pt-2.5 sm:pt-3">
          <div>
            <span className="font-black text-[#F19A0E] text-sm sm:text-base">{product.price.toLocaleString()}</span>
            <span className="text-[10px] text-gray-400 ml-0.5">ETB</span>
          </div>
          <button onClick={() => addToCart(product.id)} disabled={product.stock === 0}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-[#F5F0E8] hover:bg-[#F19A0E] text-[#2C1810] hover:text-white rounded-lg transition-colors disabled:opacity-40 active:scale-95">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main HomePage ─────────────────────────────────────────────────
export default function HomePage() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [wakingUp, setWakingUp] = useState(false);

  useEffect(() => {
    let retryTimer;
    const fetchProducts = (isRetry = false) => {
      api.get('/products?limit=8', { timeout: 35000 })
        .then(({ data }) => { setFeatured(data.products || []); setWakingUp(false); })
        .catch(() => {
          if (!isRetry) { setWakingUp(true); retryTimer = setTimeout(() => fetchProducts(true), 30000); }
        })
        .finally(() => setLoading(false));
    };
    fetchProducts();
    return () => clearTimeout(retryTimer);
  }, []);

  return (
    <div className="bg-[#F5F0E8] dark:bg-gray-950">

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#F5F0E8] dark:bg-gray-950 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 pattern-tibeb opacity-40 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-10 sm:py-14 lg:py-20">

            {/* ── Left — Text ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              {/* Amharic tag */}
              <div className="inline-flex items-center gap-2 mb-4 sm:mb-5">
                <div className="h-px w-5 bg-[#F19A0E]" />
                <span className="text-[#F19A0E] font-bold text-xs sm:text-sm tracking-widest uppercase">{t('hero.amharic')}</span>
                <div className="h-px w-5 bg-[#F19A0E]" />
              </div>

              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-black text-[#2C1810] dark:text-white leading-[1.1] mb-4 sm:mb-5">
                {t('hero.title').split('\n').map((line, i) => (
                  <span key={i}>
                    {i === 1
                      ? <span className="text-[#078930]">{line}</span>
                      : line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </h1>

              <p className="text-[#2C1810]/60 dark:text-gray-400 text-base sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8 sm:mb-10">
                <Link to="/products"
                  className="inline-flex items-center gap-2 bg-[#078930] hover:bg-[#056b25] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-[#078930]/30 hover:-translate-y-0.5 active:translate-y-0">
                  {t('hero.shop_now')} →
                </Link>
                <Link to="/about"
                  className="inline-flex items-center gap-2 border-2 border-[#2C1810]/20 dark:border-white/20 text-[#2C1810] dark:text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-bold text-sm hover:border-[#2C1810]/50 dark:hover:border-white/40 transition-all">
                  {t('hero.explore')} 🌿
                </Link>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-[#2C1810]/60 dark:text-gray-400">
                {[
                  { icon: '✅', key: 'hero.authentic' },
                  { icon: '🤝', key: 'hero.handmade' },
                  { icon: '🌍', key: 'hero.delivery' },
                ].map(({ icon, key }) => (
                  <span key={key} className="flex items-center gap-1.5 font-medium">
                    <span>{icon}</span>{t(key)}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* ── Right — Visual ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.1 }}
              className="relative flex items-center justify-center order-1 lg:order-2"
            >
              {/* Glow blobs */}
              <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#F19A0E]/10 blur-3xl" />
              <div className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-[#078930]/10 blur-2xl translate-x-8 translate-y-6" />

              {/* Spinning ring — desktop only */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] lg:w-[360px] lg:h-[360px] rounded-full border border-dashed border-[#F19A0E]/30"
              />
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-[210px] h-[210px] sm:w-[260px] sm:h-[260px] lg:w-[290px] lg:h-[290px] rounded-full border-2 border-[#F19A0E]/20"
              />
              <div className="absolute w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] lg:w-[220px] lg:h-[220px] rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(241,154,14,0.15) 0%, transparent 70%)' }} />

              {/* Logo */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10"
              >
                <motion.img
                  src="/logo.jpg"
                  alt="gebeya-B"
                  className="w-36 h-36 xs:w-44 xs:h-44 sm:w-52 sm:h-52 lg:w-56 lg:h-56 object-contain rounded-full"
                  style={{ filter: 'drop-shadow(0 8px 32px rgba(241,154,14,0.5)) drop-shadow(0 2px 8px rgba(44,24,16,0.3))' }}
                  whileHover={{ scale: 1.06, rotate: 3 }}
                  transition={{ duration: 0.35 }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
                />
                <div style={{ display: 'none' }}
                  className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-[#2C1810] border-4 border-[#F19A0E] items-center justify-center text-center">
                  <div>
                    <p className="text-[#F19A0E] font-black text-xl">ገበያ-B</p>
                    <p className="text-[#FCDD09] text-xs mt-1">Made in Ethiopia</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55, type: 'spring', stiffness: 200 }}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 shadow-xl flex items-center gap-1.5 sm:gap-2 border border-[#F19A0E]/20"
              >
                <span className="text-base sm:text-lg">🇪🇹</span>
                <div className="leading-none">
                  <p className="text-[9px] sm:text-[10px] font-black text-[#2C1810] dark:text-white">Made in Ethiopia</p>
                  <p className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5">100% Authentic</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.75, type: 'spring', stiffness: 200 }}
                className="absolute bottom-4 left-0 sm:left-2 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 shadow-xl flex items-center gap-1.5 sm:gap-2 border border-[#078930]/20"
              >
                <span className="text-base sm:text-lg">🤝</span>
                <div className="leading-none">
                  <p className="text-[9px] sm:text-[10px] font-black text-[#2C1810] dark:text-white">50+ Artisans</p>
                  <p className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5">Across 6 regions</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.95, type: 'spring', stiffness: 200 }}
                className="absolute bottom-10 right-0 sm:-right-1 bg-[#F19A0E] rounded-xl sm:rounded-2xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 shadow-xl flex items-center gap-1.5 sm:gap-2"
              >
                <span className="text-base sm:text-lg">✨</span>
                <div className="leading-none">
                  <p className="text-[9px] sm:text-[10px] font-black text-white">25+ Products</p>
                  <p className="text-[8px] sm:text-[9px] text-white/70 mt-0.5">Handcrafted</p>
                </div>
              </motion.div>

              {/* Ethiopian flag dots */}
              <div className="absolute top-1/2 -right-1 sm:-right-3 flex flex-col gap-1.5 -translate-y-1/2">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#078930]" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FCDD09]" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#DA121A]" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CATEGORY STRIP
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-gray-900 py-6 sm:py-8 shadow-sm border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 sm:gap-4 lg:gap-0 overflow-x-auto scrollbar-hide lg:justify-between pb-1">
            {CATS.map(({ key, label, img, icon }) => (
              <Link key={`${key}-${label}`} to={`/products?category=${key}`}
                className="flex flex-col items-center gap-2 shrink-0 lg:flex-1 group px-1">
                <div className="relative w-14 h-14 xs:w-16 xs:h-16 sm:w-18 sm:h-18 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700 group-hover:border-[#F19A0E] group-hover:scale-105 transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <img src={img} alt={label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='flex'; e.currentTarget.onerror=null; }} />
                  {/* Emoji fallback */}
                  <div style={{ display: 'none' }} className="absolute inset-0 bg-[#FEF3E2] flex items-center justify-center text-2xl">
                    {icon}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] xs:text-xs font-semibold text-[#2C1810] dark:text-gray-200 group-hover:text-[#F19A0E] transition-colors leading-tight">{label}</p>
                  <p className="hidden sm:block text-[9px] text-[#078930] font-medium mt-0.5">View all →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Section>
          <motion.div variants={fadeUp} className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#2C1810] dark:text-white">{t('home.featured')}</h2>
              <div className="h-1 w-12 sm:w-16 bg-[#F19A0E] rounded-full mt-2" />
            </div>
            <Link to="/products" className="text-xs sm:text-sm font-bold text-[#078930] hover:underline flex items-center gap-1 shrink-0 ml-4">
              {t('home.view_all')} →
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700" />
                  <div className="p-3 sm:p-4 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : wakingUp ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <div className="w-12 h-12 mx-auto mb-3 relative">
                <div className="absolute inset-0 rounded-full border-4 border-[#F19A0E]/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#F19A0E] animate-spin" />
              </div>
              <p className="font-bold text-gray-600 dark:text-gray-400 text-sm">Server warming up — loading shortly...</p>
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <p className="text-4xl mb-3">🛍️</p>
              <p className="font-bold text-gray-600 dark:text-gray-400">Products coming soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {featured.map((p) => <HomeProductCard key={p.id} product={p} />)}
            </div>
          )}
        </Section>
      </section>

      {/* ══════════════════════════════════════════════════════════
          STATS / TRUST
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-gray-900 py-12 sm:py-16 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#2C1810] dark:text-white mb-2">
                {t('home.made_in')} 🇪🇹
              </h2>
              <p className="text-[#2C1810]/60 dark:text-gray-400 text-sm sm:text-base max-w-lg mx-auto">{t('home.artisans_sub')}</p>
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-10 sm:mb-14">
              {[
                { n: 50,  suffix: '+', key: 'stats.artisans',  icon: '🤝', color: 'bg-[#FEF3E2]', text: 'text-[#F19A0E]' },
                { n: 25,  suffix: '+', key: 'stats.products',  icon: '🛍️', color: 'bg-[#E8F5E9]', text: 'text-[#078930]' },
                { n: 6,   suffix: '',  key: 'stats.regions',   icon: '📍', color: 'bg-[#FEE8E8]', text: 'text-[#DA121A]' },
                { n: 100, suffix: '%', key: 'stats.authentic', icon: '✅', color: 'bg-[#F5F0E8]', text: 'text-[#2C1810]' },
              ].map(({ n, suffix, key, icon, color, text }) => (
                <motion.div key={key} variants={fadeUp}
                  className={`${color} dark:bg-gray-800 rounded-2xl p-4 sm:p-6 text-center hover:scale-105 transition-transform duration-300 cursor-default`}>
                  <span className="text-2xl sm:text-3xl mb-1.5 sm:mb-2 block">{icon}</span>
                  <p className={`text-2xl sm:text-3xl font-black ${text}`}><Counter to={n} suffix={suffix} /></p>
                  <p className="text-xs sm:text-sm text-[#2C1810]/60 dark:text-gray-400 font-medium mt-0.5 sm:mt-1">{t(key)}</p>
                </motion.div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[
                { icon: '🛡️', titleKey: 'trust.made_in',  subKey: 'trust.made_sub' },
                { icon: '🔒', titleKey: 'trust.secure',   subKey: 'trust.secure_sub' },
                { icon: '🚚', titleKey: 'trust.delivery', subKey: 'trust.delivery_sub' },
                { icon: '↩️', titleKey: 'trust.returns',  subKey: 'trust.returns_sub' },
                { icon: '💬', titleKey: 'trust.support',  subKey: 'trust.support_sub' },
              ].map(({ icon, titleKey, subKey }) => (
                <motion.div key={titleKey} variants={fadeUp}
                  className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-[#F19A0E]/40 dark:hover:border-[#F19A0E]/40 hover:bg-[#FEF3E2]/30 transition-colors">
                  <span className="text-xl sm:text-2xl shrink-0">{icon}</span>
                  <div>
                    <p className="text-xs font-bold text-[#2C1810] dark:text-white">{t(titleKey)}</p>
                    <p className="text-[10px] text-gray-400">{t(subKey)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          NEWSLETTER
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-14 sm:py-20 overflow-hidden" style={{ background: '#2C1810' }}>
        <div className="absolute inset-0 pattern-tibeb opacity-30 pointer-events-none" />
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 text-center">
          <Section>
            <motion.div variants={fadeUp}>
              <div className="flex justify-center gap-1.5 mb-4 sm:mb-5">
                <span className="h-1 w-7 sm:w-8 bg-[#078930] rounded-full" />
                <span className="h-1 w-7 sm:w-8 bg-[#FCDD09] rounded-full" />
                <span className="h-1 w-7 sm:w-8 bg-[#DA121A] rounded-full" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-2 sm:mb-3">{t('home.newsletter_title')}</h2>
              <p className="text-white/60 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">{t('home.newsletter_sub')}</p>
              <div className="flex flex-col xs:flex-row gap-2 max-w-sm sm:max-w-md mx-auto">
                <input type="email" placeholder={t('home.email_placeholder')}
                  className="flex-1 px-4 py-3 sm:py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#F19A0E] transition-colors" />
                <button className="px-5 sm:px-6 py-3 sm:py-3.5 bg-[#F19A0E] hover:bg-[#d97b08] text-white rounded-xl font-bold text-sm transition-colors xs:shrink-0 active:scale-95">
                  {t('home.subscribe')}
                </button>
              </div>
              <p className="text-white/30 text-xs mt-3">No spam. Unsubscribe anytime.</p>
            </motion.div>
          </Section>
        </div>
      </section>

    </div>
  );
}
