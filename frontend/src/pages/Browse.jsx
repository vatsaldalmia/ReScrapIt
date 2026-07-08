import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import ListingCard from '../components/listing/ListingCard';
import { browseScraps } from '../api/scrap';
import { CATEGORIES } from '../constants';

export default function Browse() {
  const [filters, setFilters] = useState({ q: '', category: '', city: '', sort: 'newest', minPrice: '', maxPrice: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ scraps: [], pagination: { pages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);

  const set = (key, value) => { setFilters((prev) => ({ ...prev, [key]: value })); setPage(1); };

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

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-3 items-end">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className={`${input} w-full pl-9`}
              placeholder="Search materials..."
              value={filters.q}
              onChange={(e) => set('q', e.target.value)}
            />
          </div>
          <select className={input} value={filters.category} onChange={(e) => set('category', e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <input className={input} placeholder="City" value={filters.city} onChange={(e) => set('city', e.target.value)} />
          <input className={`${input} w-24`} type="number" placeholder="Min ₹" value={filters.minPrice} onChange={(e) => set('minPrice', e.target.value)} />
          <input className={`${input} w-24`} type="number" placeholder="Max ₹" value={filters.maxPrice} onChange={(e) => set('maxPrice', e.target.value)} />
          <select className={input} value={filters.sort} onChange={(e) => set('sort', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
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
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-100"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">Page {page} of {data.pagination.pages}</span>
                <button
                  disabled={page >= data.pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
