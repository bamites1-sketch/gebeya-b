import { useTranslation } from 'react-i18next';

const CATEGORIES = ['clothing', 'crafts', 'accessories', 'jewelry', 'art', 'food', 'music'];
const REGIONS = ['addis_ababa', 'oromia', 'amhara', 'tigray', 'snnpr', 'somali', 'afar', 'harari'];

function FilterSection({ title, children }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all";

export default function ProductFilters({ filters, onChange }) {
  const { t } = useTranslation();
  const set = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  return (
    <div className="space-y-5">
      <FilterSection title={t('common.search')}>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input type="text" value={filters.search || ''} onChange={(e) => set('search', e.target.value)}
            placeholder={t('common.search')}
            className={`${inputCls} pl-9`} />
        </div>
      </FilterSection>

      <FilterSection title={t('product.category')}>
        <select value={filters.category || ''} onChange={(e) => set('category', e.target.value)} className={inputCls}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
        </select>
      </FilterSection>

      <FilterSection title={t('product.region')}>
        <select value={filters.region || ''} onChange={(e) => set('region', e.target.value)} className={inputCls}>
          <option value="">All Regions</option>
          {REGIONS.map((r) => <option key={r} value={r}>{t(`regions.${r}`)}</option>)}
        </select>
      </FilterSection>

      <FilterSection title="Price Range (ETB)">
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.minPrice || ''}
            onChange={(e) => set('minPrice', e.target.value)} className={inputCls} min="0" />
          <input type="number" placeholder="Max" value={filters.maxPrice || ''}
            onChange={(e) => set('maxPrice', e.target.value)} className={inputCls} min="0" />
        </div>
      </FilterSection>

      <FilterSection title={t('common.sort')}>
        <select value={filters.sort || ''} onChange={(e) => set('sort', e.target.value)} className={inputCls}>
          <option value="">Newest First</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </FilterSection>

      <button onClick={() => onChange({ search: '', category: '', region: '', minPrice: '', maxPrice: '', sort: '', page: 1 })}
        className="w-full py-2.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium">
        ✕ Clear All Filters
      </button>
    </div>
  );
}
