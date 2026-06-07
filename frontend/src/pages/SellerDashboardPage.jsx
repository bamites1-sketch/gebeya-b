import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getFirstImage } from '../utils/images';
import VerifiedSellerBadge from '../components/ui/VerifiedSellerBadge';

const CATEGORIES = ['clothing', 'crafts', 'accessories', 'jewelry', 'art', 'food', 'music'];
const REGIONS = ['addis_ababa', 'oromia', 'amhara', 'tigray', 'snnpr', 'somali', 'afar', 'harari'];

const CONDITIONS = ['New', 'Used', 'Refurbished', 'Like New'];

async function fetchAiDescription(fields) {
  const { data } = await api.post('/seller/ai-description', fields);
  return data.description;
}

function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || 'clothing',
    region: product?.region || 'addis_ababa',
    stock: product?.stock ?? '',
    condition: '',
    storage: '',
    imageUrl: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const descriptionTouched = useRef(Boolean(product?.description));

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  useEffect(() => {
    if (product || descriptionTouched.current) return;
    if (!form.name.trim() || !form.condition.trim()) return;

    const timer = setTimeout(async () => {
      setGeneratingDesc(true);
      try {
        const description = await fetchAiDescription({
          name: form.name,
          category: form.category,
          region: form.region,
          condition: form.condition,
          storage: form.storage,
        });
        setForm((f) => ({ ...f, description }));
      } catch {
        // silent — manual generate still available
      } finally {
        setGeneratingDesc(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [form.name, form.condition, form.storage, form.category, form.region, product]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let description = form.description;
      if (!description?.trim() && form.name.trim()) {
        try {
          description = await fetchAiDescription({
            name: form.name,
            category: form.category,
            region: form.region,
            condition: form.condition,
            storage: form.storage,
          });
        } catch {
          toast.error('Could not generate description');
          setSaving(false);
          return;
        }
      }

      const fd = new FormData();
      const { imageUrl, condition, storage, ...formData } = form;
      const payload = { ...formData, description };
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v));

      if (images.length > 0) {
        // File uploads take priority
        images.forEach((f) => fd.append('images', f));
      } else if (imageUrl?.trim()) {
        // URL fallback — send as imageUrls JSON
        fd.append('imageUrls', JSON.stringify([imageUrl.trim()]));
      }

      if (product) {
        await api.put(`/seller/products/${product.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated');
      } else {
        await api.post('/seller/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
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
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">✕</button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {[
            { label: 'Product Name', key: 'name', placeholder: 'e.g. iPhone 13', required: true },
            { label: 'Price (ETB)', key: 'price', type: 'number', min: '0', required: true },
            { label: 'Stock', key: 'stock', type: 'number', min: '0' },
          ].map(({ label, key, ...rest }) => (
            <div key={key}>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">{label}</label>
              <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E]"
                {...rest} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Condition</label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E]">
                <option value="">Select condition</option>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Storage / Size</label>
              <input value={form.storage} onChange={(e) => setForm({ ...form, storage: e.target.value })}
                placeholder="e.g. 128GB"
                className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E]" />
            </div>
          </div>
          {/* AI Description Generator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Description {generatingDesc && <span className="text-xs text-[#F19A0E] font-normal">(generating…)</span>}
              </label>
              {form.name && (
                <button type="button"
                  onClick={async () => {
                    if (!form.name.trim()) { toast.error('Enter product name first'); return; }
                    setGeneratingDesc(true);
                    try {
                      const description = await fetchAiDescription({
                        name: form.name,
                        category: form.category,
                        region: form.region,
                        condition: form.condition,
                        storage: form.storage,
                      });
                      descriptionTouched.current = false;
                      setForm((f) => ({ ...f, description }));
                      toast.success('Description generated ✨');
                    } catch {
                      toast.error('Could not generate description');
                    } finally {
                      setGeneratingDesc(false);
                    }
                  }}
                  className="flex items-center gap-1 text-xs text-[#F19A0E] hover:underline font-bold"
                >
                  ✨ AI Generate
                </button>
              )}
            </div>
            <textarea value={form.description}
              onChange={(e) => { descriptionTouched.current = true; setForm({ ...form, description: e.target.value }); }}
              rows={3} required placeholder="Auto-generated when you enter name, condition & storage…"
              className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E] resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E]">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1">Region</label>
              <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E]">
                {REGIONS.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          {/* Product Images */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">
              Product Image <span className="text-xs font-normal text-gray-400">(paste a URL or upload)</span>
            </label>

            {/* URL input */}
            <input
              type="url"
              value={form.imageUrl || ''}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E] mb-2"
            />

            <p className="text-xs text-gray-400 mb-2 text-center">— or upload a file —</p>

            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-[#F19A0E] transition-colors bg-gray-50 dark:bg-gray-700/50">
              <span className="text-2xl mb-1">📷</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Click to upload</span>
              <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
            </label>

            {/* Previews */}
            {(previews.length > 0 || form.imageUrl) && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview"
                    className="w-16 h-16 object-cover rounded-xl border-2 border-[#F19A0E]/30"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                )}
                {previews.map((src, i) => (
                  <img key={i} src={src} alt=""
                    className="w-16 h-16 object-cover rounded-xl border-2 border-[#F19A0E]/30" />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-[#F19A0E] hover:bg-[#d97b08] text-white rounded-xl font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? 'Saving...' : 'Save Product'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:border-gray-400 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SellerDashboardPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [applyForm, setApplyForm] = useState({ shopName: '', bio: '' });
  const [applying, setApplying] = useState(false);

  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (isSeller) loadData();
    else setLoading(false);
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        api.get('/seller/products'),
        api.get('/seller/stats'),
      ]);
      setProducts(p.data);
      setStats(s.data);
    } catch {}
    finally { setLoading(false); }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyForm.shopName.trim()) { toast.error('Shop name is required'); return; }
    setApplying(true);
    try {
      const { data } = await api.post('/seller/apply', applyForm);
      updateUser(data.user);
      toast.success('Seller account activated! 🎉');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/seller/products/${id}`);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch { toast.error('Delete failed'); }
  };

  if (!user) return null;

  // Apply to become seller
  if (!isSeller) return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <p className="text-5xl mb-4">🛍️</p>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Become a Seller</h1>
        <p className="text-gray-500 dark:text-gray-400">Start selling your Ethiopian cultural products on gebeya-B</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleApply} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Shop Name *</label>
            <input value={applyForm.shopName} onChange={(e) => setApplyForm({ ...applyForm, shopName: e.target.value })}
              placeholder="e.g. Addis Crafts" required
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">About Your Shop</label>
            <textarea value={applyForm.bio} onChange={(e) => setApplyForm({ ...applyForm, bio: e.target.value })}
              rows={3} placeholder="Tell customers about your products and craftsmanship..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F19A0E] resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            {['✅ Free to join', '🛍️ Sell your crafts', '🇪🇹 Reach customers'].map((t) => (
              <div key={t} className="bg-[#F5F0E8] rounded-xl p-3 font-medium text-[#2C1810]">{t}</div>
            ))}
          </div>
          <button type="submit" disabled={applying}
            className="w-full py-3.5 bg-[#078930] hover:bg-[#056b25] text-white rounded-xl font-black transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {applying && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {applying ? 'Activating...' : 'Activate Seller Account'}
          </button>
        </form>
      </div>
    </div>
  );

  const TABS = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'products',  icon: '🛍️', label: 'My Products' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {user.shopName || 'Seller Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
            🇪🇹 gebeya-B Seller
            {user.verified && <VerifiedSellerBadge />}
          </p>
        </div>
        <div className="flex gap-2">
          {TABS.map(({ key, icon, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === key ? 'bg-[#F19A0E] text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard tab */}
      {tab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
              <p className="text-4xl font-black text-[#F19A0E] mt-1">{loading ? '...' : stats?.totalProducts ?? 0}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400">Units Sold</p>
              <p className="text-4xl font-black text-[#078930] mt-1">{loading ? '...' : stats?.totalSold ?? 0}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => { setEditProduct(null); setShowModal(true); setTab('products'); }}
                className="px-5 py-2.5 bg-[#F19A0E] text-white rounded-xl font-bold text-sm hover:bg-[#d97b08] transition-colors">
                + Add Product
              </button>
              <button onClick={() => setTab('products')}
                className="px-5 py-2.5 border-2 border-[#F19A0E] text-[#F19A0E] rounded-xl font-bold text-sm hover:bg-[#FEF3E2] transition-colors">
                View Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products tab */}
      {tab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Products ({products.length})</h2>
            <button onClick={() => { setEditProduct(null); setShowModal(true); }}
              className="px-5 py-2.5 bg-[#F19A0E] text-white rounded-xl font-bold text-sm hover:bg-[#d97b08] transition-colors">
              + Add Product
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />)}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <p className="text-4xl mb-3">🛍️</p>
              <p className="font-semibold text-gray-700 dark:text-gray-300 mb-4">No products yet</p>
              <button onClick={() => { setEditProduct(null); setShowModal(true); }}
                className="px-6 py-2.5 bg-[#F19A0E] text-white rounded-xl font-bold text-sm hover:bg-[#d97b08] transition-colors">
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              {/* Mobile card list */}
              <div className="sm:hidden divide-y dark:divide-gray-700">
                {products.map((p) => (
                  <div key={p.id} className="p-4 flex gap-3 items-start">
                    <img src={getFirstImage(p.images, p.name)} alt={p.name}
                      className="w-14 h-14 object-cover rounded-xl shrink-0"
                      onError={(e) => { e.currentTarget.src = `https://placehold.co/56x56/2C1810/F19A0E?text=${p.name[0]}`; e.currentTarget.onerror = null; }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 capitalize mt-0.5">{p.category}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-bold text-[#F19A0E] text-sm">{p.price.toLocaleString()} ETB</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.stock} left</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button onClick={() => { setEditProduct(p); setShowModal(true); }}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-xs font-semibold">Edit</button>
                      <button onClick={() => handleDelete(p.id)}
                        className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-xs font-semibold">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <table className="hidden sm:table w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>{['Product', 'Category', 'Price', 'Stock', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3 flex items-center gap-3">
                        <img src={getFirstImage(p.images, p.name)} alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg shrink-0"
                          onError={(e) => { e.currentTarget.src = `https://placehold.co/40x40/2C1810/F19A0E?text=${p.name[0]}`; e.currentTarget.onerror = null; }} />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{p.description}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300 capitalize">{p.category}</td>
                      <td className="px-5 py-3 font-bold text-[#F19A0E]">{p.price.toLocaleString()} ETB</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditProduct(p); setShowModal(true); }}
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
      )}

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSaved={() => { setShowModal(false); setEditProduct(null); loadData(); }}
        />
      )}
    </div>
  );
}
