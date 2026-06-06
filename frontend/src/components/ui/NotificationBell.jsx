import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';

const TYPE_ICONS = {
  ORDER:    '📦',
  PAYMENT:  '💳',
  REVIEW:   '⭐',
  SELLER:   '🛍️',
  ADMIN:    '⚙️',
  INFO:     'ℹ️',
};

const TYPE_COLORS = {
  ORDER:    'bg-blue-100 text-blue-600',
  PAYMENT:  'bg-green-100 text-green-600',
  REVIEW:   'bg-yellow-100 text-yellow-600',
  SELLER:   'bg-orange-100 text-orange-600',
  ADMIN:    'bg-purple-100 text-purple-600',
  INFO:     'bg-gray-100 text-gray-600',
};

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, deleteNotif } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  const handleClick = (n) => {
    if (!n.read) markRead(n.id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F5F0E8] transition-colors text-[#2C1810]/70 hover:text-[#2C1810]"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700 bg-[#F5F0E8] dark:bg-gray-700/50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#2C1810] dark:text-white text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="text-xs text-[#F19A0E] hover:underline font-semibold">
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-3xl mb-2">🔔</p>
                  <p className="text-sm text-gray-400">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b dark:border-gray-700 last:border-0 transition-colors ${
                      n.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50/50 dark:bg-blue-900/10'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm ${TYPE_COLORS[n.type] || TYPE_COLORS.INFO}`}>
                      {TYPE_ICONS[n.type] || TYPE_ICONS.INFO}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0" onClick={() => handleClick(n)}>
                      {n.link ? (
                        <Link to={n.link} className="block cursor-pointer">
                          <p className={`text-xs font-bold leading-tight ${n.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </Link>
                      ) : (
                        <div className="cursor-default">
                          <p className={`text-xs font-bold leading-tight ${n.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Unread dot + delete */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                      <button onClick={() => deleteNotif(n.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors text-xs leading-none">✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
