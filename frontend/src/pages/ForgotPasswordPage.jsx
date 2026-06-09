import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { resolveApiBaseUrl } from '../utils/apiBase';

const API = resolveApiBaseUrl(import.meta.env);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(trimmed)) { setError('Enter a valid email address'); return; }
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email: trimmed });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F5F0E8]">

      {/* ── Left panel (desktop) ── */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #2C1810 0%, #1a0e06 50%, #078930 100%)' }}>
        <div className="absolute inset-0 pattern-tibeb opacity-30" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F19A0E]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#078930]/15 rounded-full blur-3xl" />
        <div className="relative flex flex-col items-center justify-center w-full px-12 text-white text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Link to="/">
              <img src="/logo.jpg" alt="gebeya-B"
                className="w-28 h-28 object-contain rounded-full mx-auto mb-6 shadow-2xl"
                style={{ filter: 'drop-shadow(0 0 20px rgba(241,154,14,0.5))' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </Link>
            <h2 className="text-3xl font-black mb-2">ገበያ-B</h2>
            <p className="text-white/60 text-sm mb-8">Ethiopian Cultural Marketplace</p>
            <div className="bg-white/8 backdrop-blur-sm rounded-2xl px-8 py-6 text-left">
              <p className="text-2xl mb-3">🔐</p>
              <p className="text-white/90 font-semibold mb-1">Forgot your password?</p>
              <p className="text-white/55 text-sm leading-relaxed">
                No worries. Enter your email and we'll send you a secure reset link valid for 1 hour.
              </p>
            </div>
            <div className="flex gap-1.5 justify-center mt-10">
              <span className="h-1 w-8 bg-[#078930] rounded-full" />
              <span className="h-1 w-8 bg-[#FCDD09] rounded-full" />
              <span className="h-1 w-8 bg-[#DA121A] rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-6">
            <Link to="/" className="flex flex-col items-center gap-2">
              <img src="/logo.jpg" alt="gebeya-B" className="h-12 w-12 object-contain rounded-full shadow-lg"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <span className="font-black text-[#2C1810] text-base">gebeya-B</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8">

            {sent ? (
              /* ── Success state ── */
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📧</span>
                </div>
                <h1 className="text-xl font-black text-[#2C1810] mb-2">Check your inbox</h1>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  If <span className="font-semibold text-gray-700">{email}</span> is registered,
                  you'll receive a reset link shortly. The link expires in 1 hour.
                </p>
                <p className="text-xs text-gray-400 mb-6">
                  Didn't get it? Check your spam folder, or{' '}
                  <button onClick={() => { setSent(false); }}
                    className="text-[#F19A0E] font-semibold hover:underline">
                    try again
                  </button>.
                </p>
                <Link to="/login"
                  className="w-full block py-3 bg-[#F19A0E] hover:bg-[#d97b08] text-white font-bold rounded-xl transition-all text-center shadow-lg shadow-[#F19A0E]/25 hover:-translate-y-0.5">
                  Back to Sign In
                </Link>
              </motion.div>
            ) : (
              /* ── Form state ── */
              <>
                <div className="mb-6">
                  <h1 className="text-xl sm:text-2xl font-black text-[#2C1810]">Reset password</h1>
                  <p className="text-sm text-gray-400 mt-1">We'll email you a secure link to reset it.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#F19A0E] focus:border-transparent ${
                        error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    />
                    {error && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">⚠ {error}</p>}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-[#F19A0E] hover:bg-[#d97b08] active:bg-[#c06d05] text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#F19A0E]/25 hover:-translate-y-0.5">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                      : 'Send Reset Link →'
                    }
                  </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <p className="text-center text-sm text-gray-500">
                  Remember it?{' '}
                  <Link to="/login" className="text-[#F19A0E] font-bold hover:underline">Sign in</Link>
                </p>
              </>
            )}
          </div>

          <div className="h-1 w-full mt-4 rounded-full"
            style={{ background: 'linear-gradient(90deg,#078930 33%,#FCDD09 33% 66%,#DA121A 66%)' }} />
        </motion.div>
      </div>
    </div>
  );
}
