import { useEffect, useState } from 'react';
import { Search, Star, BookmarkPlus, Flame } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import ListingCard from '../components/listing/ListingCard';
import { browseScraps, getFeatured } from '../api/scrap';
import { createSavedSearch } from '../api/savedSearches';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../constants';

export default function Browse() {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState({ q: '', category: '', city: '', sort: 'newest', minPrice: '', maxPrice: '', minQuantity: '', minRating: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ scraps: [], pagination: { pages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState([]);

  const set = (key, value) => { setFilters((prev) => ({ ...prev, [key]: value })); setPage(1); };
  const hasFilters = filters.q || filters.category || filters.city || filters.minPrice || filters.maxPrice || filters.minQuantity || filters.minRating;

  useEffect(() => {
    getFeatured().then(({ data }) => setFeatured(data.scraps || [])).catch(() => {});
  }, []);

  const saveSearch = async () => {
    try {
      await createSavedSearch(filters.q || filters.category || 'My search', filters);
      alert('Search saved — you\u2019ll be notified of new matching listings.');
    } catch {
      alert('Could not save search.');
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = { ...filters, page, limit: 12 };
    Object.keys(params).forEach((k) => params[k] === '' && delete params[k]);
    const t = setTimeout(async () => {
      try {
        const { data } = await browseScraps(params);
        if (active) setData(data);
      } catch {
        if (active) setData({ scraps: [], pagination: { pages: 1, total: 0 } });
      } finally {
        if (active) setLoading(false);
      }
    }, 300);
    return () => { active = false; clearTimeout(t); };
  }, [filters, page]);

  const input = 'px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Browse Scrap & Waste</h1>

        {!hasFilters && featured.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 flex items-center gap-1 mb-3"><Flame className="h-4 w-4 text-orange-500" /> Featured</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.slice(0, 4).map((s) => <ListingCard key={s._id} scrap={s} />)}
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-3 items-end">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input className={`${input} w-full pl-9`} placeholder="Search materials..." value={filters.q} onChange={(e) => set('q', e.target.value)} />
          </div>
          <select className={input} value={filters.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <input className={input} placeholder="City" value={filters.city} onChange={(e) => set('city', e.target.value)} />
          <input className={`${input} w-24`} type="number" placeholder="Min ₹" value={filters.minPrice} onChange={(e) => set('minPrice', e.target.value)} />
          <input className={`${input} w-24`} type="number" placeholder="Max ₹" value={filters.maxPrice} onChange={(e) => set('maxPrice', e.target.value)} />
          <input className={`${input} w-28`} type="number" placeholder="Min qty" value={filters.minQuantity} onChange={(e) => set('minQuantity', e.target.value)} />
          <select className={input} value={filters.minRating} onChange={(e) => set('minRating', e.target.value)}>
            <option value="">Any rating</option>
            <option value="4">4★ & up</option>
            <option value="3">3★ & up</option>
          </select>
          <select className={input} value={filters.sort} onChange={(e) => set('sort', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top rated sellers</option>
          </select>
          {isAuthenticated && (
            <button onClick={saveSearch} className="flex items-center gap-1 text-sm border border-green-200 text-green-700 px-3 py-2 rounded-lg hover:bg-green-50">
              <BookmarkPlus className="h-4 w-4" /> Save
            </button>
          )}
        </div>

        {/* Category quick links */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => (
            <button key={c.value} onClick={() => set('category', filters.category === c.value ? '' : c.value)}
              className={`text-xs px-3 py-1 rounded-full border ${filters.category === c.value ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600'}`}>
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading listings…</p>
        ) : data.scraps.length === 0 ? (
          <p className="text-gray-500">No listings found. Try adjusting your filters.</p>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">{data.pagination.total} listing(s)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.scraps.map((s) => <ListingCard key={s._id} scrap={s} />)}
            </div>

            {data.pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-100">Previous</button>
                <span className="text-sm text-gray-600">Page {page} of {data.pagination.pages}</span>
                <button disabled={page >= data.pagination.pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-100">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
