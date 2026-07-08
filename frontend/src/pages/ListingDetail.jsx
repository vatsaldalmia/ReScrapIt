import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Package, MessageSquare, ArrowLeft, Store } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { getScrap } from '../api/scrap';
import { createChat } from '../api/chat';
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

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getScrap(id);
        setScrap(data.scrap);
      } catch {
        setScrap(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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
                  <div className="font-medium text-sm">{scrap.seller?.name || 'Seller'}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1"><Store className="h-3 w-3" /> View storefront</div>
                </div>
              </Link>
            </div>

            {!isOwner && (
              <button
                onClick={handleMessageSeller}
                disabled={starting}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                <MessageSquare className="h-5 w-5" /> {starting ? 'Starting…' : 'Message Seller'}
              </button>
            )}
            {isOwner && (
              <Link to={`/my-listings/${scrap._id}/edit`} className="mt-4 block text-center w-full border border-green-600 text-green-700 py-2.5 rounded-lg font-semibold hover:bg-green-50">
                Edit your listing
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
