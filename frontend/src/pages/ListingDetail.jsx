import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Package, MessageSquare, ArrowLeft, Store, HandCoins, X, BadgeCheck } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import StarRating from '../components/review/StarRating';
import { getScrap } from '../api/scrap';
import { createChat } from '../api/chat';
import { createOffer } from '../api/offers';
import { getListingReviews } from '../api/reviews';
import { useAuth } from '../context/AuthContext';
import { categoryLabel, formatPrice } from '../constants';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [scrap, setScrap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [starting, setStarting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showOffer, setShowOffer] = useState(false);
  const [offer, setOffer] = useState({ offeredPrice: '', offeredQuantity: '', message: '' });
  const [sendingOffer, setSendingOffer] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getScrap(id);
        setScrap(data.scrap);
        try {
          const rev = await getListingReviews(id);
          setReviews(rev.data.reviews || []);
        } catch { /* ignore */ }
      } catch {
        setScrap(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleMakeOffer = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/'); return; }
    setSendingOffer(true);
    try {
      await createOffer({
        listingId: scrap._id,
        offeredPrice: Number(offer.offeredPrice),
        offeredQuantity: Number(offer.offeredQuantity),
        message: offer.message,
      });
      setShowOffer(false);
      setOffer({ offeredPrice: '', offeredQuantity: '', message: '' });
      alert('Offer sent! Track it under Offers.');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not send offer.');
    } finally {
      setSendingOffer(false);
    }
  };

  const handleMessageSeller = async () => {
    if (!isAuthenticated) { navigate('/'); return; }
    if (String(scrap.seller?._id) === String(user?._id)) return;
    setStarting(true);
    try {
      const { data: chat } = await createChat(scrap.seller._id);
      navigate('/dashboard', { state: { openChatId: chat._id } });
    } catch {
      alert('Could not start a conversation.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) return (<div className="min-h-screen bg-gray-50"><Navbar /><p className="p-6 text-gray-500">Loading…</p></div>);
  if (!scrap) return (<div className="min-h-screen bg-gray-50"><Navbar /><p className="p-6 text-gray-500">Listing not found.</p></div>);

  const location = [scrap.location?.city, scrap.location?.state, scrap.location?.pincode].filter(Boolean).join(', ');
  const isOwner = String(scrap.seller?._id) === String(user?._id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="h-72 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {scrap.images?.[activeImg] ? (
                <img src={scrap.images[activeImg]} alt={scrap.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="h-16 w-16 text-gray-300" />
              )}
            </div>
            {scrap.images?.length > 1 && (
              <div className="flex gap-2 mt-3">
                {scrap.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`h-16 w-16 rounded-lg overflow-hidden border-2 ${i === activeImg ? 'border-green-500' : 'border-transparent'}`}>
                    <img src={img} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{categoryLabel(scrap.category)}</span>
            <h1 className="text-2xl font-bold mt-2">{scrap.name}</h1>
            <p className="text-2xl font-bold text-green-700 mt-2">{formatPrice(scrap.price, scrap.priceUnit)}</p>

            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div className="bg-white p-3 rounded-lg border"><span className="text-gray-500">Quantity</span><div className="font-semibold">{scrap.quantity}</div></div>
              <div className="bg-white p-3 rounded-lg border"><span className="text-gray-500">Min order</span><div className="font-semibold">{scrap.moq}</div></div>
            </div>

            {location && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-4">
                <MapPin className="h-4 w-4" /> {location}
              </div>
            )}

            <p className="text-gray-700 mt-4 whitespace-pre-line">{scrap.description}</p>

            {scrap.specifications && Object.keys(scrap.specifications).length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Specifications</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {Object.entries(scrap.specifications).map(([k, v]) => (
                    <li key={k}><span className="text-gray-500">{k}:</span> {String(v)}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 bg-white p-4 rounded-lg border flex items-center justify-between">
              <Link to={`/seller/${scrap.seller?._id}`} className="flex items-center gap-2 hover:underline">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {(scrap.seller?.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-sm flex items-center gap-1">
                    {scrap.seller?.name || 'Seller'}
                    {scrap.seller?.isVerified && <BadgeCheck className="h-4 w-4 text-green-600" title="Verified business" />}
                  </div>
                  <StarRating value={scrap.seller?.rating?.average || 0} count={scrap.seller?.rating?.count || 0} size={13} />
                </div>
              </Link>
              <Link to={`/seller/${scrap.seller?._id}`} className="text-xs text-gray-500 flex items-center gap-1 hover:text-green-600">
                <Store className="h-3 w-3" /> Storefront
              </Link>
            </div>

            {!isOwner && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={handleMessageSeller}
                  disabled={starting}
                  className="flex items-center justify-center gap-2 border border-green-600 text-green-700 py-2.5 rounded-lg font-semibold hover:bg-green-50 disabled:opacity-60"
                >
                  <MessageSquare className="h-5 w-5" /> {starting ? 'Starting…' : 'Message'}
                </button>
                <button
                  onClick={() => (isAuthenticated ? setShowOffer(true) : navigate('/'))}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700"
                >
                  <HandCoins className="h-5 w-5" /> Make Offer
                </button>
              </div>
            )}
            {isOwner && (
              <Link to={`/my-listings/${scrap._id}/edit`} className="mt-4 block text-center w-full border border-green-600 text-green-700 py-2.5 rounded-lg font-semibold hover:bg-green-50">
                Edit your listing
              </Link>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews for this listing yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{rev.reviewer?.name || 'Buyer'}</span>
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

      {/* Make Offer modal */}
      {showOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-30">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Make an Offer</h2>
              <button onClick={() => setShowOffer(false)} className="text-gray-500 hover:text-gray-700"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleMakeOffer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offered price per unit (₹)</label>
                <input type="number" step="0.01" required value={offer.offeredPrice} onChange={(e) => setOffer({ ...offer, offeredPrice: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (available: {scrap.quantity}, MOQ: {scrap.moq})</label>
                <input type="number" step="0.01" required value={offer.offeredQuantity} onChange={(e) => setOffer({ ...offer, offeredQuantity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                <textarea rows={2} value={offer.message} onChange={(e) => setOffer({ ...offer, message: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              </div>
              <button type="submit" disabled={sendingOffer} className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60">
                {sendingOffer ? 'Sending…' : 'Send Offer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
