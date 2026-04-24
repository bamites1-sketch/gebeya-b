import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

const CATEGORIES = ['clothing', 'crafts', 'accessories', 'jewelry', 'art', 'food', 'music'];
const REGIONS = ['addis_ababa', 'oromia', 'amhara', 'tigray', 'snnpr', 'somali', 'afar', 'harari'];

function StatCard({ label, value, icon, color, delta }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-l-4 ${color} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{value}</p>
          {delta && <p className="text-xs text-green-600 mt-1 font-medium">{delta}</p>}
        </div>
        <span className="text-3xl opacity-80">{icon}</span>
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, onSaved, t }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || 'clothing',
    region: product?.region || 'addis_ababa',
    stock: product?.stock ?? '',
  });
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((f) => fd.append('images', f));
      if (product) {
        await api.put(`/products/${product.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {product ? t('admin.edit_product') : t('admin.add_product')}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">✕</button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <Input label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Habesha Kemis" />
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} required placeholder="Describe the product..."
              className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (ETB)" type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="0" />
            <Input label="Stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                {CATEGORIES.map((c) => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Region</label>
              <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                {REGIONS.map((r) => <option key={r} value={r}>{t(`regions.${r}`)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Images (up to 5)</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 file:font-medium file:cursor-pointer" />
            {images.length > 0 && <p className="text-xs text-gray-500 mt-1">{images.length} file(s) selected</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} className="flex-1" size="lg">{t('common.save')}</Button>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1" size="lg">{t('common.cancel')}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, p, o] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/products?limit=100'),
        api.get('/admin/orders'),
      ]);
      setStats(s.data);
      setProducts(p.data.products || []);
      setOrders(o.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (stats) setStats((s) => ({ ...s, totalProducts: s.totalProducts - 1 }));
    } catch {
      toast.error('Delete failed');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { key: 'dashboard', icon: '📊', label: t('admin.dashboard') },
    { key: 'products', icon: '🛍️', label: t('admin.products') },
    { key: 'orders', icon: '📦', label: t('admin.orders') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Admin header */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{t('admin.dashboard')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gebeya-B Management Console</p>
          </div>
          <div className="flex gap-2">
            {TABS.map(({ key, icon, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === key ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <span>{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Dashboard ── */}
        {tab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />) : (
                <>
                  <StatCard label={t('admin.total_users')} value={stats?.totalUsers || 0} icon="👥" color="border-blue-500" delta="+12% this month" />
                  <StatCard label={t('admin.total_products')} value={stats?.totalProducts || 0} icon="🛍️" color="border-primary-500" delta={`${products.filter(p => p.stock > 0).length} in stock`} />
                  <StatCard label={t('admin.total_orders')} value={stats?.totalOrders || 0} icon="📦" color="border-green-500" delta="+5 today" />
                  <StatCard label={t('admin.total_revenue')} value={`${(stats?.totalRevenue || 0).toLocaleString()} ETB`} icon="💰" color="border-yellow-500" delta="+8% this week" />
                </>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => { setEditProduct(null); setShowForm(true); setTab('products'); }}>
                  + Add Product
                </Button>
                <Button variant="secondary" onClick={() => setTab('orders')}>View Orders</Button>
                <Button variant="outline" onClick={loadData}>↻ Refresh Data</Button>
              </div>
            </div>

            {/* Recent products */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white">Recent Products</h3>
                <button onClick={() => setTab('products')} className="text-sm text-primary-600 hover:underline">View all</button>
              </div>
              {loading ? (
                <div className="p-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
              ) : products.length === 0 ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-4xl mb-3">🛍️</p>
                  <p>No products yet. Add your first product!</p>
                  <Button className="mt-4" onClick={() => { setEditProduct(null); setShowForm(true); }}>+ Add Product</Button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>{['Name', 'Category', 'Price', 'Stock'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {products.slice(0, 5).map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                        <td className="px-6 py-3 text-gray-500 dark:text-gray-400 capitalize">{p.category}</td>
                        <td className="px-6 py-3 text-primary-600 font-semibold">{p.price.toLocaleString()} ETB</td>
                        <td className="px-6 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.stock > 10 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {p.stock > 0 ? `${p.stock} left` : 'Out of stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── Products ── */}
        {tab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-sm">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
                  className="w-full px-4 py-2.5 border rounded-xl text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">{filteredProducts.length} products</span>
                <Button onClick={() => { setEditProduct(null); setShowForm(true); }}>+ {t('admin.add_product')}</Button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-16 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="text-lg font-medium">{search ? 'No products match your search' : 'No products yet'}</p>
                  {!search && <Button className="mt-4" onClick={() => { setEditProduct(null); setShowForm(true); }}>+ Add First Product</Button>}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>{['Product', 'Category', 'Region', 'Price', 'Stock', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.description}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300 capitalize">{p.category}</td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400 capitalize text-xs">{p.region?.replace('_', ' ') || '—'}</td>
                          <td className="px-6 py-4 font-bold text-primary-600">{p.price.toLocaleString()} ETB</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.stock > 10 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditProduct(p); setShowForm(true); }}
                                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors">
                                Edit
                              </button>
                              <button onClick={() => handleDelete(p.id)}
                                className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Orders ── */}
        {tab === 'orders' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">All Orders ({orders.length})</h3>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : orders.length === 0 ? (
              <div className="p-16 text-center text-gray-500 dark:text-gray-400">
                <p className="text-5xl mb-4">📦</p>
                <p className="text-lg font-medium">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>{['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-gray-900 dark:text-white">#{o.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 dark:text-white">{o.user?.name}</p>
                          <p className="text-xs text-gray-400">{o.user?.email}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{o.items?.length || 0} items</td>
                        <td className="px-6 py-4 font-bold text-primary-600">{o.totalPrice?.toLocaleString()} ETB</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            o.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                            o.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            o.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>{o.status}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product modal */}
      {showForm && (
        <ProductModal
          product={editProduct}
          onClose={() => { setShowForm(false); setEditProduct(null); }}
          onSaved={() => { setShowForm(false); setEditProduct(null); loadData(); }}
          t={t}
        />
      )}
    </div>
  );
}
