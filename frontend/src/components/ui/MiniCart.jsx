import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { getFirstImage } from '../../utils/images';

export default function MiniCart({ open, onClose }) {
  const { t } = useTranslation();
  const { cart, updateItem, removeItem, total, itemCount } = useCart();
  const ref = useRef(null);
  const items = cart?.items || [];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Drawer */}
      <div ref={ref} className="relative w-full max-w-sm bg-white dark:bg-gray-900 h-full flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h2 className="font-bold text-gray-900 dark:text-white">{t('cart.title')}</h2>
            {itemCount > 0 && (
              <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{itemCount}</span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">✕</button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{t('cart.empty')}</p>
              <p className="text-sm text-gray-400 mb-6">Add some Ethiopian treasures!</p>
              <Link to="/products" onClick={onClose}
                className="bg-primary-500 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-primary-600 transition-colors">
                {t('cart.continue')}
              </Link>
            </div>
          ) : (
            items.map((item) => {
              const img = getFirstImage(item.product.images, item.product.name);
              const placeholder = `https://placehold.co/64x64/2C1810/F19A0E?text=${item.product.name[0]}`;
              return (
                <div key={item.id} className="flex gap-3 group">
                  <Link to={`/products/${item.product.id}`} onClick={onClose} className="shrink-0">
                    <img
                      src={img}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl"
                      onError={(e) => { e.currentTarget.src = placeholder; e.currentTarget.onerror = null; }}
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product.id}`} onClick={onClose}
                      className="text-sm font-semibold text-gray-900 dark:text-white hover:text-primary-600 transition-colors line-clamp-1">
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-primary-600 font-bold mt-0.5">{item.product.price.toLocaleString()} {t('common.etb')}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border dark:border-gray-600 rounded-lg overflow-hidden">
                        <button onClick={() => updateItem(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-bold transition-colors">−</button>
                        <span className="w-8 text-center text-xs font-bold dark:text-white">{item.quantity}</span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-bold transition-colors">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-gray-900 dark:text-white">{(item.product.price * item.quantity).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{t('common.etb')}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t dark:border-gray-700 px-5 py-4 space-y-3 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="font-black text-gray-900 dark:text-white">{total.toLocaleString()} {t('common.etb')}</span>
            </div>
            <Link to="/cart" onClick={onClose}
              className="block w-full bg-primary-500 hover:bg-primary-600 text-white text-center py-3.5 rounded-xl font-bold transition-colors">
              {t('cart.checkout')} →
            </Link>
            <button onClick={onClose}
              className="block w-full text-center text-sm text-gray-500 hover:text-primary-600 transition-colors py-1">
              ← {t('cart.continue')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
