import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { getFirstImage } from '../utils/images';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

// ── Animation helpers ─────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

function Section({ children, className = '' }) {
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

// ── Category strip data ───────────────────────────────────────────
const CATS = [
  { key: 'clothing',    label: 'Traditional\nClothing',   img: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=200&q=80' },
  { key: 'crafts',      label: 'Handmade\nCrafts',        img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&q=80' },
  { key: 'food',        label: 'Cultural\nItems',         img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=80' },
  { key: 'food',        label: 'Food &\nDrink',           img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&q=80' },
  { key: 'music',       label: 'Musical\nInstruments',    img: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200&q=80' },
  { key: 'accessories', label: 'Accessories\n& Jewelry',  img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&q=80' },
];

// ── Counter animation ─────────────────────────────────────────────
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 40);
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(t); }
      else setVal(start);
    }, 35);
    return () => clearInterval(t);
  }, [inView, to]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// ── Product card (homepage style) ────────────────────────────────
function HomeProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const img = getFirstImage(product.images, product.name);
  const inWishlist = isInWishlist(product.id);

  return (
    <motion.div variants={fadeUp}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col">
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden aspect-[4/3]">
        <img src={img} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.currentTarget.src = `https://placehold.co/400x300/2C1810/F19A0E?text=${product.name[0]}`; e.currentTarget.onerror = null; }} />
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
            inWishlist ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:text-red-500'
          }`}>
          <svg width="14" height="14" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-[#2C1810] text-sm leading-snug hover:text-[#F19A0E] transition-colors line-clamp-1">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between mt-auto pt-3">
          <span className="font-black text-[#F19A0E] text-base">{product.price.toLocaleString()} <span className="text-xs font-normal text-gray-400">ETB</span></span>
          <button onClick={() => addToCart(product.id)} disabled={product.stock === 0}
            className="w-8 h-8 flex items-center justify-center bg-[#F5F0E8] hover:bg-[#F19A0E] text-[#2C1810] hover:text-white rounded-lg transition-colors disabled:opacity-40">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products?limit=6')
      .then(({ data }) => setFeatured(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#F5F0E8] dark:bg-gray-950">

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#F5F0E8] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 lg:py-16 grid lg:grid-cols-2 gap-10 items-center">

          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            {/* Amharic tag */}
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-6 bg-[#F19A0E]" />
              <span className="text-[#F19A0E] font-bold text-sm tracking-wide">{t('hero.amharic')}</span>
              <div className="h-px w-6 bg-[#F19A0E]" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#2C1810] leading-tight mb-5">
              {t('hero.title').split("'s").length > 1 ? (
                <>{t('hero.title').split('\n')[0]}<br /><span className="text-[#078930]">{t('hero.title').split('\n')[1] || 'Rich Heritage'}</span></>
              ) : (
                <>{t('hero.title')}</>
              )}
            </h1>

            <p className="text-[#2C1810]/60 text-lg mb-8 max-w-md leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link to="/products"
                className="inline-flex items-center gap-2 bg-[#078930] hover:bg-[#056b25] text-white px-7 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-[#078930]/25 hover:-translate-y-0.5">
                {t('hero.shop_now')} →
              </Link>
              <Link to="/about"
                className="inline-flex items-center gap-2 border-2 border-[#2C1810]/20 text-[#2C1810] px-7 py-3.5 rounded-full font-bold text-sm hover:border-[#2C1810]/50 transition-all">
                {t('hero.explore')} 🌿
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-5 text-sm text-[#2C1810]/60">
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

          {/* Right — aesthetic logo showcase */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* ── Background decorative blobs ── */}
            <div className="absolute w-80 h-80 rounded-full bg-[#F19A0E]/8 blur-3xl" />
            <div className="absolute w-60 h-60 rounded-full bg-[#078930]/8 blur-2xl translate-x-12 translate-y-8" />

            {/* ── Outer spinning ring ── */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute w-[340px] h-[340px] rounded-full border border-dashed border-[#F19A0E]/25"
            />

            {/* ── Middle pulsing ring ── */}
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-[280px] h-[280px] rounded-full border-2 border-[#F19A0E]/20"
            />

            {/* ── Inner glow ring ── */}
            <div className="absolute w-[220px] h-[220px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(241,154,14,0.12) 0%, transparent 70%)' }} />

            {/* ── Logo ── */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <motion.img
                src="/logo.jpg"
                alt="Made in Ethiopia — gebeya-B"
                className="w-52 h-52 object-contain rounded-full"
                style={{
                  filter: 'drop-shadow(0 8px 32px rgba(241,154,14,0.45)) drop-shadow(0 2px 8px rgba(44,24,16,0.3))',
                }}
                whileHover={{ scale: 1.06, rotate: 3 }}
                transition={{ duration: 0.35 }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }}
              />
              {/* Fallback */}
              <div style={{ display: 'none' }}
                className="w-52 h-52 rounded-full bg-[#2C1810] border-4 border-[#F19A0E] items-center justify-center text-center">
                <div>
                  <p className="text-[#F19A0E] font-black text-xl">ገበያ-B</p>
                  <p className="text-[#FCDD09] text-xs mt-1">Made in Ethiopia</p>
                </div>
              </div>
            </motion.div>

            {/* ── Floating badge — top right ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="absolute top-4 right-4 bg-white rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center gap-2 border border-[#F19A0E]/20"
            >
              <span className="text-lg">🇪🇹</span>
              <div className="leading-none">
                <p className="text-[10px] font-black text-[#2C1810]">Made in Ethiopia</p>
                <p className="text-[9px] text-gray-400 mt-0.5">100% Authentic</p>
              </div>
            </motion.div>

            {/* ── Floating badge — bottom left ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="absolute bottom-6 left-2 bg-white rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center gap-2 border border-[#078930]/20"
            >
              <span className="text-lg">🤝</span>
              <div className="leading-none">
                <p className="text-[10px] font-black text-[#2C1810]">50+ Artisans</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Across 6 regions</p>
              </div>
            </motion.div>

            {/* ── Floating badge — bottom right ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              className="absolute bottom-10 right-0 bg-[#F19A0E] rounded-2xl px-3.5 py-2.5 shadow-xl flex items-center gap-2"
            >
              <span className="text-lg">✨</span>
              <div className="leading-none">
                <p className="text-[10px] font-black text-white">25+ Products</p>
                <p className="text-[9px] text-white/70 mt-0.5">Handcrafted</p>
              </div>
            </motion.div>

            {/* ── Ethiopian flag dots ── */}
            <div className="absolute top-1/2 -right-2 flex flex-col gap-1.5 -translate-y-1/2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#078930]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FCDD09]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#DA121A]" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CATEGORY STRIP
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide justify-start lg:justify-between pb-1">
            {CATS.map(({ key, label, img }) => (
              <Link key={label} to={`/products?category=${key}`}
                className="flex flex-col items-center gap-2.5 shrink-0 group">
                <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-[#F19A0E] transition-all shadow-sm group-hover:shadow-md">
                  <img src={img} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.src = `https://placehold.co/80x80/2C1810/F19A0E?text=${label[0]}`; e.currentTarget.onerror = null; }} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-[#2C1810] group-hover:text-[#F19A0E] transition-colors leading-tight whitespace-pre-line text-center">{label}</p>
                  <p className="text-[10px] text-[#078930] font-medium mt-0.5">View all →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-14">
        <Section>
          <motion.div variants={fadeUp} className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-[#2C1810]">{t('home.featured')}</h2>
              <div className="h-1 w-16 bg-[#F19A0E] rounded-full mt-2" />
            </div>
            <Link to="/products" className="text-sm font-bold text-[#078930] hover:underline flex items-center gap-1">
              {t('home.view_all')} →
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featured.map((p) => <HomeProductCard key={p.id} product={p} />)}
            </div>
          )}
        </Section>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TRUST / STATS SECTION
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-black text-[#2C1810] mb-2">{t('home.made_in')} 🇪🇹</h2>
              <p className="text-[#2C1810]/60">{t('home.artisans_sub')}</p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { n: 50,  suffix: '+', key: 'stats.artisans',  icon: '🤝', color: 'bg-[#FEF3E2]', text: 'text-[#F19A0E]' },
                { n: 25,  suffix: '+', key: 'stats.products',  icon: '🛍️', color: 'bg-[#E8F5E9]', text: 'text-[#078930]' },
                { n: 6,   suffix: '',  key: 'stats.regions',   icon: '📍', color: 'bg-[#FEE8E8]', text: 'text-[#DA121A]' },
                { n: 100, suffix: '%', key: 'stats.authentic', icon: '✅', color: 'bg-[#F5F0E8]', text: 'text-[#2C1810]' },
              ].map(({ n, suffix, key, icon, color, text }) => (
                <motion.div key={key} variants={fadeUp} className={`${color} rounded-2xl p-6 text-center`}>
                  <span className="text-3xl mb-2 block">{icon}</span>
                  <p className={`text-3xl font-black ${text}`}><Counter to={n} suffix={suffix} /></p>
                  <p className="text-sm text-[#2C1810]/60 font-medium mt-1">{t(key)}</p>
                </motion.div>
              ))}
            </div>

            {/* Trust badges row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { icon: '🛡️', titleKey: 'trust.made_in',  subKey: 'trust.made_sub' },
                { icon: '🔒', titleKey: 'trust.secure',   subKey: 'trust.secure_sub' },
                { icon: '🚚', titleKey: 'trust.delivery', subKey: 'trust.delivery_sub' },
                { icon: '↩️', titleKey: 'trust.returns',  subKey: 'trust.returns_sub' },
                { icon: '💬', titleKey: 'trust.support',  subKey: 'trust.support_sub' },
              ].map(({ icon, titleKey, subKey }) => (
                <motion.div key={titleKey} variants={fadeUp}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-[#F19A0E]/30 transition-colors">
                  <span className="text-2xl shrink-0">{icon}</span>
                  <div>
                    <p className="text-xs font-bold text-[#2C1810]">{t(titleKey)}</p>
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
      <section className="relative py-16 overflow-hidden" style={{ background: '#2C1810' }}>
        <div className="absolute inset-0 pattern-tibeb opacity-30 pointer-events-none" />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <Section>
            <motion.div variants={fadeUp}>
              <div className="flex justify-center gap-1.5 mb-5">
                <span className="h-1 w-8 bg-[#078930] rounded-full" />
                <span className="h-1 w-8 bg-[#FCDD09] rounded-full" />
                <span className="h-1 w-8 bg-[#DA121A] rounded-full" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-white mb-3">{t('home.newsletter_title')}</h2>
              <p className="text-white/60 mb-8">{t('home.newsletter_sub')}</p>
              <div className="flex gap-2 max-w-md mx-auto">
                <input type="email" placeholder={t('home.email_placeholder')}
                  className="flex-1 px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#F19A0E] transition-colors" />
                <button className="px-6 py-3.5 bg-[#F19A0E] hover:bg-[#d97b08] text-white rounded-xl font-bold text-sm transition-colors shrink-0">
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
