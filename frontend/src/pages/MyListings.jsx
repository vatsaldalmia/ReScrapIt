import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { getMyListings, deleteScrap } from '../api/scrap';
import { categoryLabel, formatPrice } from '../constants';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await getMyListings();
      setListings(data.scraps || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await deleteScrap(id);
      setListings((prev) => prev.filter((s) => s._id !== id));
    } catch {
      alert('Failed to delete listing.');
    }
  };

  const statusColor = {
    active: 'bg-green-50 text-green-700',
    paused: 'bg-yellow-50 text-yellow-700',
    sold: 'bg-gray-100 text-gray-600',
    expired: 'bg-red-50 text-red-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Listings</h1>
          <Link to="/my-listings/new" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            <Plus className="h-4 w-4" /> New Listing
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">You have no listings yet.</p>
            <Link to="/my-listings/new" className="text-green-600 font-medium hover:underline">Create your first listing</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((s) => (
              <div key={s._id} className="bg-white p-4 rounded-lg border flex items-center gap-4">
                <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  {s.images?.[0] ? <img src={s.images[0]} alt={s.name} className="w-full h-full object-cover" /> : <Package className="h-6 w-6 text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link to={`/listing/${s._id}`} className="font-semibold hover:underline truncate">{s.name}</Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[s.status] || ''}`}>{s.status}</span>
                  </div>
                  <div className="text-sm text-gray-500">{categoryLabel(s.category)} · Qty {s.quantity} · {formatPrice(s.price, s.priceUnit)}</div>
                </div>
                <Link to={`/my-listings/${s._id}/edit`} className="p-2 text-gray-500 hover:text-green-600" title="Edit">
                  <Pencil className="h-4 w-4" />
                </Link>
                <button onClick={() => handleDelete(s._id)} className="p-2 text-gray-500 hover:text-red-600" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
