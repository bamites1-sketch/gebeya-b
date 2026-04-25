import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    category: searchParams.get('category') || '',
    region:   searchParams.get('region')   || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort:     searchParams.get('sort')     || '',
    page:     parseInt(searchParams.get('page')) || 1,
  });

  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
    try {
      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      setError(true);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const activeFilterCount = [filters.category, filters.region, filters.minPrice, filters.maxPrice, filters.search].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">{t('nav.products')}</h1>
          {!loading && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{total} products found</p>}
        </div>
        {/* Mobile filter toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-sm font-semibold shadow-sm">
          🔧 Filters {activeFilterCount > 0 && <span className="bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">Filters</h2>
              {activeFilterCount > 0 && (
                <button onClick={() => setFilters({ search: '', category: '', region: '', minPrice: '', maxPrice: '', sort: '', page: 1 })}
                  className="text-xs text-red-500 hover:text-red-700 font-medium">Clear all</button>
              )}
            </div>
            <ProductFilters filters={filters} onChange={(f) => { setFilters(f); setSidebarOpen(false); }} />
          </div>
        </aside>

        {/* Products area */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-5 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {loading ? 'Loading...' : `${total} result${total !== 1 ? 's' : ''}`}
            </p>
            <select value={filters.sort} onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))}
              className="text-sm border-0 bg-transparent dark:text-gray-200 focus:outline-none cursor-pointer font-medium">
              <option value="">Newest first</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>

          <ProductGrid products={products} loading={loading} />

          {/* Error / empty state */}
          {!loading && error && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <p className="text-4xl mb-3">⏳</p>
              <p className="font-bold text-gray-700 mb-1">Backend is waking up...</p>
              <p className="text-sm text-gray-400 mb-4">The server may take ~30 seconds to start. Please wait.</p>
              <button onClick={load}
                className="px-6 py-2.5 bg-[#F19A0E] text-white rounded-xl font-bold text-sm hover:bg-[#d97b08] transition-colors">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <p className="text-4xl mb-3">🇪🇹</p>
              <p className="font-bold text-gray-700">No products yet. Check back soon!</p>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))}
                disabled={filters.page === 1}
                className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors text-sm font-bold">
                ‹
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setFilters((f) => ({ ...f, page: p }))}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${filters.page === p ? 'bg-primary-500 text-white shadow-md scale-110' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setFilters((f) => ({ ...f, page: Math.min(pages, f.page + 1) }))}
                disabled={filters.page === pages}
                className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors text-sm font-bold">
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
