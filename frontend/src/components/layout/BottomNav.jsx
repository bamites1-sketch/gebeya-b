import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const { user } = useAuth();
  const wishCount = wishlist?.items?.length || 0;
  const isActive = (p) => location.pathname === p || location.pathname.startsWith(p + '/');

  const navItems = [
    {
      to: '/',
      exact: true,
      label: 'Home',
      icon: (active) => (
        <svg width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      to: '/products',
      label: 'Shop',
      icon: (active) => (
        <svg width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      ),
    },
    {
      to: '/cart',
      label: 'Cart',
      badge: itemCount,
      icon: (active) => (
        <svg width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
        </svg>
      ),
    },
    {
      to: '/wishlist',
      label: 'Saved',
      badge: wishCount,
      icon: (active) => (
        <svg width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      ),
    },
    {
      to: user ? '/profile' : '/login',
      label: user ? 'Me' : 'Login',
      icon: (active) => (
        <svg width="22" height="22" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-bottom">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map(({ to, label, icon, badge, exact }) => {
          const active = exact ? location.pathname === to : isActive(to);
          return (
            <Link key={to} to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[52px] transition-colors relative ${
                active ? 'text-[#F19A0E]' : 'text-gray-400 dark:text-gray-500'
              }`}>
              <span className="relative">
                {icon(active)}
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#F19A0E] text-white text-[9px] font-black rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </span>
              <span className={`text-[10px] font-semibold leading-none ${active ? 'text-[#F19A0E]' : 'text-gray-400 dark:text-gray-500'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
