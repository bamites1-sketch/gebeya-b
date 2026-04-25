import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
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
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, error, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F19A0E] transition-colors ${error ? 'border-red-400' : 'border-gray-200'}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <img src="/logo.jpg" alt="gebeya-B"
              className="h-16 w-16 object-contain rounded-full shadow-lg"
              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span className="text-2xl font-black text-[#2C1810]">gebeya-B</span>
            <span className="text-xs text-gray-400 uppercase tracking-widest">Ethiopian Cultural Marketplace</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-xl font-bold text-[#2C1810] mb-1">Create Account</h1>
          <p className="text-sm text-gray-400 mb-6">Join gebeya-B in seconds.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name} placeholder="Abebe Kebede" autoComplete="name" />

            <Field label="Email" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email} placeholder="you@example.com" autoComplete="email" />

            <Field label="Password" type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password} placeholder="Min. 6 characters" autoComplete="new-password" />

            <Field label="Confirm Password" type="password" value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              error={errors.confirm} placeholder="Repeat password" autoComplete="new-password" />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#078930] hover:bg-[#056b25] text-white font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#F19A0E] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        {/* Flag stripe */}
        <div className="h-1 w-full mt-6 rounded-full overflow-hidden"
          style={{ background: 'linear-gradient(90deg,#078930 33%,#FCDD09 33% 66%,#DA121A 66%)' }} />
      </div>
    </div>
  );
}
