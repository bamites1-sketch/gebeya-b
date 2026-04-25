import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to gebeya-B 🇪🇹');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500'];

  return (
    <div className="min-h-screen flex bg-[#F5F0E8]">

      {/* ── Left panel (desktop only) ── */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #078930 0%, #2C1810 60%, #1a0e06 100%)' }}>
        <div className="absolute inset-0 pattern-tibeb opacity-30" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#FCDD09]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#F19A0E]/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col items-center justify-center w-full px-12 text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-center">
            <Link to="/">
              <img src="/logo.jpg" alt="gebeya-B"
                className="w-28 h-28 object-contain rounded-full mx-auto mb-6 shadow-2xl"
                style={{ filter: 'drop-shadow(0 0 20px rgba(241,154,14,0.5))' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </Link>
            <h2 className="text-3xl font-black mb-2">Join gebeya-B</h2>
            <p className="text-white/60 text-sm mb-10">Support Ethiopian artisans worldwide</p>

            <div className="space-y-3 text-left">
              {[
                { icon: '✅', text: 'Free account, always' },
                { icon: '❤️', text: 'Save your wishlist' },
                { icon: '📦', text: 'Track your orders' },
                { icon: '🌍', text: 'Worldwide delivery' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3 bg-white/8 backdrop-blur-sm rounded-xl px-4 py-3">
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm font-medium text-white/80">{text}</span>
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

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Link to="/" className="flex flex-col items-center gap-2">
              <img src="/logo.jpg" alt="gebeya-B" className="h-14 w-14 object-contain rounded-full shadow-lg"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <span className="font-black text-[#2C1810] text-lg">gebeya-B</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-black text-[#2C1810]">Create your account</h1>
              <p className="text-sm text-gray-400 mt-1">Join thousands of Ethiopian culture lovers</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Abebe Kebede"
                  autoComplete="name"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#F19A0E] focus:border-transparent ${
                    errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1.5">⚠ {errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#F19A0E] focus:border-transparent ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1.5">⚠ {errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#F19A0E] focus:border-transparent ${
                      errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {/* Strength bar */}
                {form.password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{strengthLabel[strength]}</span>
                  </div>
                )}
                {errors.password && <p className="text-xs text-red-500 mt-1.5">⚠ {errors.password}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 pr-12 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#F19A0E] focus:border-transparent ${
                      errors.confirm ? 'border-red-400 bg-red-50'
                      : form.confirm && form.confirm === form.password ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">
                    {showConfirm ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.confirm && <p className="text-xs text-red-500 mt-1.5">⚠ {errors.confirm}</p>}
                {!errors.confirm && form.confirm && form.confirm === form.password && (
                  <p className="text-xs text-green-600 mt-1.5">✓ Passwords match</p>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-[#078930] hover:bg-[#056b25] text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#078930]/25 hover:-translate-y-0.5 hover:shadow-xl mt-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</>
                  : 'Create Account →'
                }
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-[#F19A0E] font-bold hover:underline">Sign in</Link>
            </p>
          </div>

          <div className="h-1 w-full mt-5 rounded-full"
            style={{ background: 'linear-gradient(90deg,#078930 33%,#FCDD09 33% 66%,#DA121A 66%)' }} />
        </motion.div>
      </div>
    </div>
  );
}
