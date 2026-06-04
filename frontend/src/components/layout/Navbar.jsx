import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getFirstImage } from '../../utils/images';
import api from '../../services/api';

const LANGUAGES = [
  { code: 'en', label: 'EN',  name: 'English',  flag: '🇬🇧' },
  { code: 'am', label: 'አማ', name: 'አማርኛ',    flag: '🇪🇹' },
  { code: 'ti', label: 'ትግ', name: 'ትግርኛ',    flag: '🇪🇹' },
  { code: 'om', label: 'ORO', name: 'Afan Oromo', flag: '🇪🇹' },
];

const CATEGORIES = [
  { label: 'Traditional Clothing',  to: '/products?category=clothing',    icon: '👗' },
  { label: 'Handmade Crafts',       to: '/products?category=crafts',       icon: '🏺' },
  { label: 'Musical Instruments',   to: '/products?category=music',        icon: '🎵' },
  { label: 'Art & Paintings',       to: '/products?category=art',          icon: '🎨' },
  { label: 'Traditional Food',      to: '/products?category=food',         icon: '☕' },
  { label: 'Accessories & Jewelry', to: '/products?category=accessories',  icon: '💍' },
  { label: 'Cultural Items',        to: '/products?category=crafts',       icon: '✝️' },
];

const dropdownV = {
  hidden: { opacity: 0, y: -6, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.16, ease: 'easeOut' } },
  exit:   { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.12 } },
};

const drawerV = {
  hidden: { x: '100%' },
  show:   { x: 0, transition: { type: 'spring', damping: 28, stiffness: 260 } },
  exit:   { x: '100%', transition: { duration: 0.22, ease: 'easeIn' } },
};

const itemV = {
  hidden: { opacity: 0, x: 20 },
  show: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.25 } }),
};

// ── Search Panel ──────────────────────────────────────────────────
function SearchPanel({ onClose }) {
  const [q, setQ]         = useState('');
  const [results, setRes] = useState([]);
  const [busy, setBusy]   = useState(false);
  const navigate          = useNavigate();
  const ref               = useRef(null);

  useEffect(() => { ref.current?.focus(); }, []);
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    if (!q.trim()) { setRes([]); return; }
    const t = setTimeout(async () => {
      setBusy(true);
      try { const { data } = await api.get('/products', { params: { search: q, limit: 5 } }); setRes(data.products || []); }
      catch { setRes([]); }
      finally { setBusy(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
        className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-2xl z-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 border-2 border-[#F19A0E] rounded-xl px-4 py-3">
            <span className="text-gray-400">🔍</span>
            <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search Ethiopian products..."
              className="flex-1 bg-transparent outline-none text-[#2C1810] dark:text-white text-base" />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
          </div>
          {busy && <div className="flex justify-center py-6"><div className="w-5 h-5 border-2 border-[#F19A0E] border-t-transparent rounded-full animate-spin" /></div>}
          {!busy && results.length > 0 && (
            <div className="mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {results.map((p) => (
                <button key={p.id} onClick={() => { navigate(`/products/${p.id}`); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FEF3E2] transition-colors text-left border-b last:border-0 dark:border-gray-700">
                  <img src={getFirstImage(p.images, p.name)} alt={p.name}
                    className="w-10 h-10 object-cover rounded-lg shrink-0"
                    onError={(e) => { e.currentTarget.src = `https://placehold.co/40x40/2C1810/F19A0E?text=${p.name[0]}`; e.currentTarget.onerror = null; }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#2C1810] dark:text-white truncate text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                  </div>
                  <p className="text-sm font-bold text-[#F19A0E] shrink-0">{p.price.toLocaleString()} ETB</p>
                </button>
              ))}
              <button onClick={() => { navigate(`/products?search=${encodeURIComponent(q)}`); onClose(); }}
                className="w-full py-3 text-sm font-bold text-[#F19A0E] hover:bg-[#FEF3E2] transition-colors text-center">
                View all results for "{q}" →
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────
export default function Navbar() {
  const { t, i18n }               = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const { itemCount }             = useCart();
  const { wishlist }              = useWishlist();
  const navigate                  = useNavigate();
  const location                  = useLocation();

  const [scrolled,      setScrolled]      = useState(false);
  const [catOpen,       setCatOpen]       = useState(false);
  const [userOpen,      setUserOpen]      = useState(false);
  const [langOpen,      setLangOpen]      = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);

  const catRef  = useRef(null);
  const userRef = useRef(null);
  const langRef = useRef(null);

  const wishCount = wishlist?.items?.length || 0;
  const isActive  = useCallback((p) => location.pathname === p, [location.pathname]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    setMobileOpen(false); setCatOpen(false); setUserOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fn = (e) => {
      if (catRef.current  && !catRef.current.contains(e.target))  setCatOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => { logout(); navigate('/'); setUserOpen(false); setMobileOpen(false); };

  const NavLink = ({ to, children }) => (
    <Link to={to}
      className={`relative text-sm font-semibold transition-colors pb-1 group ${
        isActive(to) ? 'text-[#2C1810]' : 'text-[#2C1810]/70 hover:text-[#2C1810]'
      }`}>
      {children}
      <span className={`absolute bottom-0 left-0 h-0.5 bg-[#F19A0E] rounded-full transition-all duration-300 ${
        isActive(to) ? 'w-full' : 'w-0 group-hover:w-full'
      }`} />
    </Link>
  );

  return (
    <>
      {/* ── Navbar ── */}
      <nav className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-[70px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <motion.img src="/logo.jpg" alt="gebeya-B"
              className="h-12 w-12 object-contain rounded-full"
              whileHover={{ scale: 1.08, rotate: 2 }}
              transition={{ duration: 0.25 }}
              style={{ filter: 'drop-shadow(0 2px 8px rgba(241,154,14,0.3))' }}
              onError={(e) => { e.currentTarget.style.display='none'; }} />
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-lg font-black text-[#2C1810] tracking-tight">gebeya-B</span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">Ethiopian Cultural Marketplace</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-7">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/products">Shop</NavLink>

            {/* Categories dropdown */}
            <div className="relative" ref={catRef}>
              <button
                onClick={() => setCatOpen(!catOpen)}
                className={`relative text-sm font-semibold transition-colors pb-1 flex items-center gap-1 group ${
                  catOpen ? 'text-[#2C1810]' : 'text-[#2C1810]/70 hover:text-[#2C1810]'
                }`}>
                Categories
                <motion.span animate={{ rotate: catOpen ? 180 : 0 }} transition={{ duration: 0.2 }}
                  className="text-xs opacity-60">▾</motion.span>
                <span className={`absolute bottom-0 left-0 h-0.5 bg-[#F19A0E] rounded-full transition-all duration-300 ${catOpen ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </button>

              <AnimatePresence>
                {catOpen && (
                  <motion.div variants={dropdownV} initial="hidden" animate="show" exit="exit"
                    className="absolute left-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden py-2">
                    {CATEGORIES.map(({ label, to, icon }) => (
                      <Link key={label} to={to} onClick={() => setCatOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#FEF3E2] transition-colors group/item">
                        <span className="text-lg w-7 text-center">{icon}</span>
                        <span className="text-sm font-medium text-[#2C1810] group-hover/item:text-[#F19A0E] transition-colors">{label}</span>
                        <span className="ml-auto text-xs text-gray-300 group-hover/item:text-[#F19A0E] transition-colors">→</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/about">About Us</NavLink>
            <NavLink to="/about#contact">Contact</NavLink>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button onClick={() => setSearchOpen(true)} aria-label="Search"
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F5F0E8] transition-colors text-[#2C1810]/70 hover:text-[#2C1810]">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* Language switcher */}
            <div className="relative hidden sm:block" ref={langRef}>
              <button
                onClick={() => { setLangOpen(!langOpen); setUserOpen(false); setCatOpen(false); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-[#F5F0E8] transition-colors text-[#2C1810]/70 hover:text-[#2C1810] text-xs font-bold border border-gray-200 hover:border-[#F19A0E]"
                aria-label="Language"
              >
                🌐 <span>{LANGUAGES.find(l => l.code === i18n.language)?.label || 'EN'}</span>
                <motion.span animate={{ rotate: langOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-[10px] opacity-50">▾</motion.span>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div variants={dropdownV} initial="hidden" animate="show" exit="exit"
                    className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden py-1">
                    {LANGUAGES.map(({ code, label, name, flag }) => (
                      <button key={code}
                        onClick={() => { i18n.changeLanguage(code); localStorage.setItem('lang', code); setLangOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          i18n.language === code
                            ? 'bg-[#FEF3E2] text-[#F19A0E] font-bold'
                            : 'text-[#2C1810] hover:bg-[#F5F0E8]'
                        }`}>
                        <span>{flag}</span>
                        <span className="flex-1 text-left">{name}</span>
                        <span className="text-xs opacity-50 font-mono">{label}</span>
                        {i18n.language === code && <span className="text-[#F19A0E]">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User */}
            <div className="relative" ref={userRef}>
              <button onClick={() => { setUserOpen(!userOpen); }}
                aria-label="Account"
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F5F0E8] transition-colors text-[#2C1810]/70 hover:text-[#2C1810]">
                {user ? (
                  <div className="w-7 h-7 bg-[#F19A0E] rounded-full flex items-center justify-center text-white font-black text-xs">
                    {user.name[0].toUpperCase()}
                  </div>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </button>

              <AnimatePresence>
                {userOpen && (
                  <motion.div variants={dropdownV} initial="hidden" animate="show" exit="exit"
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    {user ? (
                      <>
                        <div className="px-4 py-3 bg-[#FEF3E2] border-b border-gray-100">
                          <p className="font-bold text-[#2C1810] text-sm truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        {[
                          { to: '/profile',  icon: '👤', label: 'My Profile' },
                          { to: '/wishlist', icon: '❤️', label: 'Wishlist' },
                          { to: '/profile',  icon: '📦', label: 'My Orders' },
                          ...(isAdmin ? [{ to: '/admin', icon: '⚙️', label: 'Admin Panel' }] : []),
                        ].map(({ to, icon, label }) => (
                          <Link key={label} to={to} onClick={() => setUserOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#2C1810] hover:bg-[#FEF3E2] transition-colors">
                            <span>{icon}</span>{label}
                          </Link>
                        ))}
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100">
                          🚪 Logout
                        </button>
                      </>
                    ) : (
                      <div className="p-3 space-y-2">
                        <Link to="/login" onClick={() => setUserOpen(false)}
                          className="block w-full text-center py-2.5 bg-[#F19A0E] text-white rounded-xl text-sm font-bold hover:bg-[#d97b08] transition-colors">
                          Login
                        </Link>
                        <Link to="/register" onClick={() => setUserOpen(false)}
                          className="block w-full text-center py-2.5 border-2 border-[#F19A0E] text-[#F19A0E] rounded-xl text-sm font-bold hover:bg-[#FEF3E2] transition-colors">
                          Register
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <button onClick={() => navigate('/wishlist')} aria-label="Wishlist"
              className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F5F0E8] transition-colors text-[#2C1810]/70 hover:text-[#2C1810]">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {wishCount > 9 ? '9+' : wishCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button onClick={() => navigate('/cart')} aria-label="Cart"
              className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F5F0E8] transition-colors text-[#2C1810]/70 hover:text-[#2C1810]">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span key={itemCount} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 bg-[#F19A0E] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F5F0E8] transition-colors ml-1"
              aria-label="Menu">
              <svg width="20" height="20" fill="none" stroke="#2C1810" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Gold bottom border */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#078930] via-[#F19A0E] to-[#DA121A]" />
      </nav>

      {/* ── Search panel ── */}
      <AnimatePresence>
        {searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div variants={drawerV} initial="hidden" animate="show" exit="exit"
              className="fixed right-0 top-0 h-full w-[280px] bg-white z-50 flex flex-col shadow-2xl lg:hidden">

              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <img src="/logo.jpg" alt="gebeya-B" className="h-9 w-9 object-contain rounded-full"
                    onError={(e) => { e.currentTarget.style.display='none'; }} />
                  <span className="font-black text-[#2C1810]">gebeya-B</span>
                </div>
                <button onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
              </div>

              {/* Drawer links */}
              <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {[
                  { to: '/',         label: 'Home',    icon: '🏠' },
                  { to: '/products', label: 'Shop',    icon: '🛍️' },
                  { to: '/about',    label: 'About Us',icon: 'ℹ️' },
                  { to: '/wishlist', label: 'Wishlist',icon: '❤️' },
                  { to: '/cart',     label: 'Cart',    icon: '🛒' },
                  ...(user ? [{ to: '/profile', label: 'My Profile', icon: '👤' }] : []),
                  ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: '⚙️' }] : []),
                ].map(({ to, label, icon }, i) => (
                  <motion.div key={to} custom={i} variants={itemV} initial="hidden" animate="show">
                    <Link to={to} onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isActive(to)
                          ? 'bg-[#FEF3E2] text-[#F19A0E]'
                          : 'text-[#2C1810] hover:bg-[#F5F0E8]'
                      }`}>
                      <span className="text-base">{icon}</span>{label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile categories */}
                <div>
                  <button onClick={() => setMobileCatOpen(!mobileCatOpen)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#2C1810] hover:bg-[#F5F0E8] transition-colors">
                    <span>📂</span>
                    <span className="flex-1 text-left">Categories</span>
                    <motion.span animate={{ rotate: mobileCatOpen ? 180 : 0 }} className="text-xs opacity-50">▾</motion.span>
                  </button>
                  <AnimatePresence>
                    {mobileCatOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-4">
                        {CATEGORIES.map(({ label, to, icon }) => (
                          <Link key={label} to={to} onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-[#2C1810]/70 hover:text-[#F19A0E] transition-colors">
                            <span>{icon}</span>{label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>

              {/* Drawer footer */}
              <div className="px-4 py-4 border-t border-gray-100 space-y-3">
                {/* Language switcher in mobile */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">🌐 Language</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {LANGUAGES.map(({ code, label, flag }) => (
                      <button key={code}
                        onClick={() => { i18n.changeLanguage(code); localStorage.setItem('lang', code); }}
                        className={`flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                          i18n.language === code
                            ? 'bg-[#F19A0E] text-white'
                            : 'bg-[#F5F0E8] text-[#2C1810] hover:bg-[#F19A0E]/20'
                        }`}>
                        <span>{flag}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {user ? (
                  <button onClick={handleLogout}
                    className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">
                    🚪 Logout
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center py-3 bg-[#F19A0E] text-white rounded-xl text-sm font-bold">Login</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center py-3 border-2 border-[#F19A0E] text-[#F19A0E] rounded-xl text-sm font-bold">Register</Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
