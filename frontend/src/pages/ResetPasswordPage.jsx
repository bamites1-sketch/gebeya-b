import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { resolveApiBaseUrl } from '../utils/apiBase';

const API = resolveApiBaseUrl(import.meta.env);

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  // If no token in URL, redirect immediately
  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link. Please request a new one.');
      navigate('/forgot-password', { replace: true });
    }
  }, [token, navigate]);

  const validate = () => {
    const e = {};
    if (!form.password) e.password = 'New password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { token, password: form.password });
      setDone(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. The link may have expired.';
      toast.error(msg);
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
        setErrors({ token: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength];
  const strengthColor = ['', '#DA121A', '#F19A0E', '#FCDD09', '#78c800', '#078930'][strength];

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
            <div className="bg-white/8 backdrop-blur-sm rounded-2xl px-8 py-6 text-left space-y-2">
              {['At least 6 characters', 'Mix of letters and numbers', 'Special characters recommended'].map((tip) => (
                <div key={tip} className="flex items-center gap-2 text-sm text-white/70">
                  <span className="text-[#F19A0E]">✓</span> {tip}
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 justify-center mt-10">
              <span className="h-1 w-8 bg-[#078930] rounded-full" />
              <span className="h-1 w-8 bg-[#FCDD09] rounded-full" />
              <span className="h-1 w-8 bg-[#DA121A] rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right panel ── */}
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

            {done ? (
              /* ── Success state ── */
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h1 className="text-xl font-black text-[#2C1810] mb-2">Password updated!</h1>
                <p className="text-sm text-gray-500 mb-6">
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
                <Link to="/login"
                  className="w-full block py-3 bg-[#F19A0E] hover:bg-[#d97b08] text-white font-bold rounded-xl transition-all text-center shadow-lg shadow-[#F19A0E]/25 hover:-translate-y-0.5">
                  Sign In →
                </Link>
              </motion.div>
            ) : errors.token ? (
              /* ── Invalid token state ── */
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔗</span>
                </div>
                <h1 className="text-xl font-black text-[#2C1810] mb-2">Link expired</h1>
                <p className="text-sm text-gray-500 mb-6">{errors.token}</p>
                <Link to="/forgot-password"
                  className="w-full block py-3 bg-[#F19A0E] hover:bg-[#d97b08] text-white font-bold rounded-xl transition-all text-center">
                  Request a new link
                </Link>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div className="mb-6">
                  <h1 className="text-xl sm:text-2xl font-black text-[#2C1810]">Set new password</h1>
                  <p className="text-sm text-gray-400 mt-1">Choose a strong password for your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* New password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">New password</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        autoFocus
                        className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#F19A0E] focus:border-transparent ${
                          errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg transition-colors p-1">
                        {showPass ? '🙈' : '👁'}
                      </button>
                    </div>
                    {/* Strength meter */}
                    {form.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex-1 h-1 rounded-full transition-all"
                              style={{ background: i <= strength ? strengthColor : '#e5e7eb' }} />
                          ))}
                        </div>
                        <p className="text-xs" style={{ color: strengthColor }}>{strengthLabel}</p>
                      </div>
                    )}
                    {errors.password && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">⚠ {errors.password}</p>}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={form.confirm}
                        onChange={(e) => { setForm({ ...form, confirm: e.target.value }); setErrors({ ...errors, confirm: '' }); }}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#F19A0E] focus:border-transparent ${
                          errors.confirm ? 'border-red-400 bg-red-50'
                          : form.confirm && form.password === form.confirm ? 'border-green-400 bg-green-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg transition-colors p-1">
                        {showConfirm ? '🙈' : '👁'}
                      </button>
                    </div>
                    {form.confirm && form.password === form.confirm && !errors.confirm && (
                      <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">✓ Passwords match</p>
                    )}
                    {errors.confirm && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">⚠ {errors.confirm}</p>}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-[#F19A0E] hover:bg-[#d97b08] active:bg-[#c06d05] text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#F19A0E]/25 hover:-translate-y-0.5">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating...</>
                      : 'Set New Password →'
                    }
                  </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-5">
                  <Link to="/login" className="text-[#F19A0E] font-bold hover:underline">← Back to Sign In</Link>
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
