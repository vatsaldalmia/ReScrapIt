import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import ListingCard from '../components/listing/ListingCard';
import { getWishlist } from '../api/wishlist';

export default function Wishlist() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getWishlist();
        setListings(data.wishlist.listings || []);
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6"><Heart className="h-6 w-6 text-green-600" /> Wishlist</h1>
        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No saved items yet.</p>
            <Link to="/browse" className="text-green-600 font-medium hover:underline">Browse listings</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map((s) => <ListingCard key={s._id} scrap={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
