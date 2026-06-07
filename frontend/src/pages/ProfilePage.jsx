import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const STATUS_STYLES = {
  PENDING:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED:    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', password: '' });
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [becomingSeller, setBecomingSeller] = useState(false);
  const [sellerForm, setSellerForm] = useState({ shopName: '', bio: '' });
  const [showSellerForm, setShowSellerForm] = useState(false);

  const handleBecomeSeller = async (e) => {
    e.preventDefault();
    if (!sellerForm.shopName.trim()) { toast.error('Shop name is required'); return; }
    setBecomingSeller(true);
    try {
      const { data } = await api.post('/seller/apply', { shopName: sellerForm.shopName.trim(), bio: sellerForm.bio.trim() });
      updateUser(data.user);
      toast.success('🎉 Seller account activated!');
      setShowSellerForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to activate seller account');
    } finally {
      setBecomingSeller(false);
    }
  };

  useEffect(() => {
    api.get('/orders/my')
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name cannot be empty'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name };
      if (form.password) payload.password = form.password;
      const { data } = await api.put('/auth/profile', payload);
      updateUser(data);
      setForm((f) => ({ ...f, password: '' }));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-7xl mb-6">👤</p>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sign in to view your profile</h2>
      <Link to="/login" className="inline-flex bg-primary-500 text-white px-8 py-3.5 rounded-full font-bold hover:bg-primary-600 transition-colors">
        {t('auth.login')}
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header */}
      <div className="flex items-center gap-4 sm:gap-5 mb-8 sm:mb-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black shadow-lg shrink-0">
          {user.name[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white truncate">{user.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{user.email}</p>
          <span className={`inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${user.role === 'ADMIN' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
            {user.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 sm:mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit max-w-full overflow-x-auto scrollbar-hide">
        {[['profile', '👤', 'Profile'], ['orders', '📦', `Orders (${orders.length})`]].map(([key, icon, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeTab === key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            <span>{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 dark:text-white mb-5">Edit Profile</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <Input label={t('auth.name')} value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <div>
                <Input label="Email" value={user.email} disabled
                  className="opacity-60 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>
              <Input label="New Password" type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Leave blank to keep current" />
              <Button type="submit" loading={saving} className="w-full" size="lg">
                {t('common.save')} Changes
              </Button>
            </form>
          </div>

          {/* Become a Seller */}
          {user.role === 'USER' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mt-4 border-2 border-dashed border-[#F19A0E]/30">
              <div className="flex items-start gap-4">
                <span className="text-3xl">🛍️</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">Start Selling on gebeya-B</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    List your Ethiopian cultural products and reach customers worldwide. Free to join.
                  </p>
                  {!showSellerForm ? (
                    <button
                      onClick={() => setShowSellerForm(true)}
                      className="px-5 py-2.5 bg-[#078930] hover:bg-[#056b25] text-white rounded-xl font-bold text-sm transition-colors">
                      🇪🇹 Become a Seller
                    </button>
                  ) : (
                    <form onSubmit={handleBecomeSeller} className="space-y-3">
                      <input
                        value={sellerForm.shopName}
                        onChange={(e) => setSellerForm(f => ({ ...f, shopName: e.target.value }))}
                        placeholder="Shop name *"
                        required
                        className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E]"
                      />
                      <input
                        value={sellerForm.bio}
                        onChange={(e) => setSellerForm(f => ({ ...f, bio: e.target.value }))}
                        placeholder="About your shop (optional)"
                        className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E]"
                      />
                      <div className="flex gap-2">
                        <button type="submit" disabled={becomingSeller}
                          className="px-5 py-2.5 bg-[#078930] hover:bg-[#056b25] text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-60 flex items-center gap-2">
                          {becomingSeller && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                          {becomingSeller ? 'Activating...' : 'Activate'}
                        </button>
                        <button type="button" onClick={() => setShowSellerForm(false)}
                          className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Seller dashboard link — shown once they're a seller */}
          {(user.role === 'SELLER' || user.role === 'ADMIN') && (
            <div className="bg-[#F5F0E8] dark:bg-[#2C1810]/30 rounded-2xl p-5 shadow-sm mt-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-[#2C1810] dark:text-white">🛍️ {user.shopName || 'Seller Account'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage your products and track sales</p>
              </div>
              <Link to="/seller"
                className="px-5 py-2.5 bg-[#F19A0E] hover:bg-[#d97b08] text-white rounded-xl font-bold text-sm transition-colors">
                Open Dashboard →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Orders tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <p className="text-5xl mb-4">📦</p>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No orders yet</p>
              <Link to="/products" className="text-primary-600 hover:underline text-sm">Start shopping →</Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">Order #{order.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] || STATUS_STYLES.PENDING}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-primary-600">{order.totalPrice?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">ETB</p>
                  </div>
                </div>
                {order.items?.length > 0 && (
                  <div className="mt-3 pt-3 border-t dark:border-gray-700 flex flex-wrap gap-2">
                    {order.items.slice(0, 3).map((item) => (
                      <span key={item.id} className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg">
                        {item.product?.name} ×{item.quantity}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
