import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Store, Calendar, BadgeCheck } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import ListingCard from '../components/listing/ListingCard';
import StarRating from '../components/review/StarRating';
import { getPublicUser } from '../api/users';
import { getSellerListings } from '../api/scrap';
import { getSellerReviews } from '../api/reviews';

export default function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [u, l, r] = await Promise.all([getPublicUser(id), getSellerListings(id), getSellerReviews(id)]);
        setSeller(u.data.user);
        setListings(l.data.scraps || []);
        setReviews(r.data.reviews || []);
      } catch {
        setSeller(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (<div className="min-h-screen bg-gray-50"><Navbar /><p className="p-6 text-gray-500">Loading…</p></div>);
  if (!seller) return (<div className="min-h-screen bg-gray-50"><Navbar /><p className="p-6 text-gray-500">Seller not found.</p></div>);

  const memberSince = seller.createdAt ? new Date(seller.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-700">
            {seller.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {seller.name}
              <Store className="h-5 w-5 text-green-600" />
              {seller.isVerified && <span className="flex items-center gap-1 text-sm text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><BadgeCheck className="h-4 w-4" /> Verified</span>}
            </h1>
            {seller.companyName && <p className="text-sm text-gray-600">{seller.companyName}</p>}
            <div className="mt-1"><StarRating value={seller.rating?.average || 0} count={seller.rating?.count || 0} /></div>
            {memberSince && (
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Calendar className="h-4 w-4" /> Member since {memberSince}
              </p>
            )}
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">Active listings ({listings.length})</h2>
        {listings.length === 0 ? (
          <p className="text-gray-500">This seller has no active listings.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map((s) => <ListingCard key={s._id} scrap={s} />)}
          </div>
        )}

        <h2 className="text-lg font-semibold mt-10 mb-4">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-4 max-w-2xl">
            {reviews.map((rev) => (
              <div key={rev._id} className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">{rev.reviewer?.name || 'Buyer'}</span>
                    {rev.listing?.name && <span className="text-xs text-gray-400"> · {rev.listing.name}</span>}
                  </div>
                  <StarRating value={rev.rating} size={14} />
                </div>
                {rev.text && <p className="text-sm text-gray-600 mt-2">{rev.text}</p>}
                {rev.sellerResponse?.text && (
                  <div className="mt-2 ml-4 pl-3 border-l-2 border-green-200 text-sm text-gray-600">
                    <span className="font-medium text-green-700">Seller response:</span> {rev.sellerResponse.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
