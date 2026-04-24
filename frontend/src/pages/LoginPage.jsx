import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GebeyaLogo from '../components/ui/Logo';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(t('auth.login_success'));
      navigate(user.role === 'ADMIN' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#2C1810] via-[#1a0e06] to-[#078930] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pattern-tibeb opacity-60 pointer-events-none" />
        <div className="relative text-center text-white px-12">
          {/* Logo — no link (already inside a page, not navbar) */}
          <GebeyaLogo size="2xl" linkTo={null} animate glow className="justify-center mb-6" />
          <h2 className="text-3xl font-black mb-3">ገበያ-B</h2>
          <p className="text-lg text-white/80 max-w-xs mx-auto leading-relaxed">
            Your gateway to authentic Ethiopian culture
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 text-left">
            {['👗 Traditional Clothing', '🏺 Handcrafts', '💍 Accessories', '🎨 Art & Culture'].map((item) => (
              <div key={item} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-sm font-medium">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-10">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <GebeyaLogo size="md" linkTo={null} glow={false} />
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black text-[#F19A0E]">ገበያ-B</span>
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Made in Ethiopia</span>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{t('auth.login')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Sign in to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label={t('auth.email')} type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email} placeholder="you@example.com" autoComplete="email" />
            <Input label={t('auth.password')} type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password} placeholder="••••••••" autoComplete="current-password" />
            <Button type="submit" loading={loading} className="w-full" size="lg">{t('auth.login')}</Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">{t('auth.register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
