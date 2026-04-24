import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GebeyaLogo from '../components/ui/Logo';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
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
      toast.success(t('auth.register_success'));
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#078930] via-[#2C1810] to-[#1a0e06] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pattern-tibeb opacity-60 pointer-events-none" />
        <div className="relative text-center text-white px-12">
          <GebeyaLogo size="2xl" linkTo={null} animate glow className="justify-center mb-6" />
          <h2 className="text-3xl font-black mb-3">Join Us</h2>
          <p className="text-lg text-white/80 max-w-xs mx-auto leading-relaxed">
            Discover and support Ethiopian artisans
          </p>
          <div className="mt-10 space-y-3 text-left">
            {['✓ Free account, always', '✓ Save your wishlist', '✓ Track your orders', '✓ Exclusive deals'].map((item) => (
              <div key={item} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-sm font-medium">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{t('auth.register')}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Create your account in seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t('auth.name')} value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name} placeholder="Abebe Kebede" autoComplete="name" />
            <Input label={t('auth.email')} type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email} placeholder="you@example.com" autoComplete="email" />
            <Input label={t('auth.password')} type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password} placeholder="Min. 6 characters" autoComplete="new-password" />
            <Input label={t('auth.confirm_password')} type="password" value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              error={errors.confirm} placeholder="Repeat password" autoComplete="new-password" />
            <Button type="submit" loading={loading} className="w-full" size="lg">{t('auth.register')}</Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            {t('auth.have_account')}{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
