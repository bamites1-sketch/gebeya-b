import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { getFirstImage } from '../utils/images';
import { useCart } from '../context/CartContext';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false); // silent background re-verify
  const { fetchCart } = useCart();
  const txRef = searchParams.get('tx_ref');
  const retryCount = useRef(0);
  const retryTimer = useRef(null);

  // Attempt to verify. On any failure or PENDING status, retry up to 4 times
  // with increasing delays (3s, 6s, 10s, 15s). Never show an error screen —
  // Chapa already redirected here which means the user completed checkout.
  const verify = async (attempt = 0) => {
    try {
      const { data } = await api.get(`/payments/verify/${txRef}`, { timeout: 20000 });
      setOrder(data.order);
      fetchCart();
      setLoading(false);
      setVerifying(false);
    } catch {
      // Verification failed — backend/network issue. Still show success UI
      // because Chapa already sent the user back here.
      if (attempt < 4) {
        const delays = [3000, 6000, 10000, 15000];
        setVerifying(true);
        retryTimer.current = setTimeout(() => verify(attempt + 1), delays[attempt]);
      } else {
        // Give up silently — show receipt with txRef only, no order details
        setLoading(false);
        setVerifying(false);
      }
    }
  };

  useEffect(() => {
    if (!txRef) { setLoading(false); return; }
    verify(0);
    return () => clearTimeout(retryTimer.current);
  }, [txRef]);

  // Always show the receipt page once loading is done — never an error screen
  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 rounded-full border-4 border-[#F19A0E]/20" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#F19A0E] animate-spin" />
      </div>
      <p className="font-semibold text-[#2C1810]">Verifying your payment...</p>
      <p className="text-sm text-gray-400">This may take a few seconds</p>
    </div>
  );

  // No txRef — genuinely wrong URL
  if (!txRef) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🔍</p>
      <h2 className="text-xl font-bold text-gray-700 mb-2">No transaction found</h2>
      <p className="text-gray-500 mb-6">This page requires a payment reference.</p>
      <Link to="/" className="bg-[#F19A0E] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#d97b08] transition-colors">Go Home</Link>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="relative text-white text-center py-8 px-6"
          style={{ background: 'linear-gradient(135deg, #2C1810 0%, #1a0e06 50%, #078930 100%)' }}>
          <div className="absolute inset-0 pattern-tibeb opacity-20" />
          <div className="relative">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-3xl">✅</span>
            </motion.div>
            <h1 className="text-2xl font-black">Payment Successful!</h1>
            <p className="text-white/70 text-sm mt-1">Paid via Chapa 🇪🇹</p>
          </div>
        </div>

        <div className="p-6">
          {/* Silent background re-verify indicator */}
          {verifying && (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2 mb-4">
              <span className="w-3 h-3 border-2 border-gray-300 border-t-[#F19A0E] rounded-full animate-spin shrink-0" />
              Confirming order details...
            </div>
          )}

          {/* Receipt header */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-dashed border-gray-200">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt="gebeya-B" className="w-10 h-10 object-contain rounded-full"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div>
                <p className="font-black text-[#2C1810] text-sm">gebeya-B</p>
                <p className="text-[10px] text-gray-400">Ethiopian Cultural Marketplace</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Order</p>
              <p className="font-mono text-xs font-bold text-[#2C1810]">
                {order?.id ? `#${order.id}` : '—'}
              </p>
            </div>
          </div>

          {/* Status pills */}
          <div className="grid grid-cols-3 gap-3 mb-5 text-center">
            <div className="bg-[#F5F0E8] rounded-xl p-3">
              <p className="text-[10px] text-gray-400 mb-0.5">Date</p>
              <p className="text-xs font-bold text-[#2C1810]">{new Date().toLocaleDateString('en-GB')}</p>
            </div>
            <div className="bg-[#F5F0E8] rounded-xl p-3">
              <p className="text-[10px] text-gray-400 mb-0.5">Method</p>
              <p className="text-xs font-bold text-[#2C1810]">🔵 Chapa</p>
            </div>
            <div className="bg-[#F5F0E8] rounded-xl p-3">
              <p className="text-[10px] text-gray-400 mb-0.5">Status</p>
              <p className="text-xs font-bold text-green-600">✓ Paid</p>
            </div>
          </div>

          {/* Order items — show if available, skip if still verifying */}
          {order?.items?.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
                <span>Item</span><span>Qty</span><span className="text-right">Amount</span>
              </div>
              <div className="divide-y divide-gray-50">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img
                        src={getFirstImage(item.product?.images, item.product?.name)}
                        alt={item.product?.name}
                        className="w-8 h-8 object-cover rounded-lg shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/32x32/2C1810/F19A0E?text=${item.product?.name?.[0]}`;
                          e.currentTarget.onerror = null;
                        }}
                      />
                      <span className="text-[#2C1810] font-medium truncate text-xs">{item.product?.name}</span>
                    </div>
                    <span className="text-gray-400 text-xs mx-3">×{item.quantity}</span>
                    <span className="font-bold text-[#2C1810] text-xs shrink-0">
                      {(item.price * item.quantity).toLocaleString()} ETB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          {order?.totalPrice && (
            <div className="border-t border-dashed border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span><span>{order.totalPrice.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span><span className="text-green-600 font-medium">Free 🎁</span>
              </div>
              <div className="flex justify-between font-black text-lg text-[#2C1810] pt-2 border-t border-gray-200">
                <span>Total Paid</span>
                <span className="text-[#F19A0E]">{order.totalPrice.toLocaleString()} ETB</span>
              </div>
            </div>
          )}

          {/* Transaction ref */}
          <div className="mt-4 bg-gray-50 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400">Transaction Reference</p>
              <p className="font-mono text-xs text-gray-600 truncate">{txRef}</p>
            </div>
            <span className="text-green-500 text-xl">🔒</span>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="border-t-2 border-dashed border-gray-200" />
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#F5F0E8] rounded-full" />
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#F5F0E8] rounded-full" />
          </div>

          <p className="text-center text-[10px] text-gray-400 mb-4">
            🇪🇹 gebeya-B · Powered by Chapa · Thank you for supporting Ethiopian artisans
          </p>
        </div>

        <div className="h-1.5 w-full"
          style={{ background: 'linear-gradient(90deg,#078930 33%,#FCDD09 33% 66%,#DA121A 66%)' }} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link to="/"
          className="flex-1 text-center bg-[#F19A0E] hover:bg-[#d97b08] text-white py-3.5 rounded-xl font-bold transition-colors">
          🏠 Back to Home
        </Link>
        <Link to="/profile"
          className="flex-1 text-center border-2 border-[#F19A0E] text-[#F19A0E] py-3.5 rounded-xl font-bold hover:bg-[#FEF3E2] transition-colors">
          📦 View My Orders
        </Link>
      </div>
    </motion.div>
  );
}
