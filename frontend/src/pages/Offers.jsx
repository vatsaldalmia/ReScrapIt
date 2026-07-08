import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { getMyOffers, respondOffer, confirmOffer } from '../api/offers';

const statusBadge = {
  pending: 'bg-yellow-50 text-yellow-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-600',
  countered: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-gray-100 text-gray-600',
};

export default function Offers() {
  const navigate = useNavigate();
  const [data, setData] = useState({ asBuyer: [], asSeller: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    try {
      const { data } = await getMyOffers();
      setData(data);
    } catch {
      setData({ asBuyer: [], asSeller: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRespond = async (id, action) => {
    let counterPrice;
    if (action === 'counter') {
      const v = window.prompt('Enter your counter price per unit:');
      if (v === null) return;
      counterPrice = Number(v);
    }
    setBusy(id);
    try {
      await respondOffer(id, action, counterPrice);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Action failed');
    } finally {
      setBusy(null);
    }
  };

  const handleConfirm = async (id) => {
    setBusy(id);
    try {
      const { data } = await confirmOffer(id);
      navigate(`/orders/${data.order._id}`);
    } catch (e) {
      alert(e.response?.data?.message || 'Could not confirm offer');
      setBusy(null);
    }
  };

  const Badge = ({ status }) => (
    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[status] || ''}`}>{status}</span>
  );

  const OfferRow = ({ offer, role }) => {
    const who = role === 'buyer' ? offer.seller : offer.buyer;
    const price = offer.status === 'countered' ? offer.counterPrice : offer.offeredPrice;
    return (
      <div className="bg-white p-4 rounded-lg border flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{offer.listing?.name || 'Listing'}</span>
            <Badge status={offer.status} />
          </div>
          <div className="text-sm text-gray-500">
            {role === 'buyer' ? 'Seller' : 'Buyer'}: {who?.name} · Qty {offer.offeredQuantity} · ₹{price}/unit
            {offer.status === 'countered' && <span className="text-blue-600"> (countered from ₹{offer.offeredPrice})</span>}
          </div>
          {offer.message && <p className="text-xs text-gray-400 mt-1">“{offer.message}”</p>}
        </div>
        <div className="flex gap-2">
          {role === 'seller' && ['pending', 'countered'].includes(offer.status) && (
            <>
              <button disabled={busy === offer._id} onClick={() => handleRespond(offer._id, 'accept')} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">Accept</button>
              <button disabled={busy === offer._id} onClick={() => handleRespond(offer._id, 'counter')} className="text-sm border px-3 py-1.5 rounded-lg hover:bg-gray-50">Counter</button>
              <button disabled={busy === offer._id} onClick={() => handleRespond(offer._id, 'reject')} className="text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">Reject</button>
            </>
          )}
          {role === 'buyer' && ['accepted', 'countered'].includes(offer.status) && (
            <button disabled={busy === offer._id} onClick={() => handleConfirm(offer._id)} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
              Confirm &amp; Order
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Offers</h1>
        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold mb-3">Offers received (as seller)</h2>
              {data.asSeller.length === 0 ? (
                <p className="text-gray-500 text-sm">No offers received.</p>
              ) : (
                <div className="space-y-3">{data.asSeller.map((o) => <OfferRow key={o._id} offer={o} role="seller" />)}</div>
              )}
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-3">Offers I&apos;ve made (as buyer)</h2>
              {data.asBuyer.length === 0 ? (
                <p className="text-gray-500 text-sm">You haven&apos;t made any offers yet.</p>
              ) : (
                <div className="space-y-3">{data.asBuyer.map((o) => <OfferRow key={o._id} offer={o} role="buyer" />)}</div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
