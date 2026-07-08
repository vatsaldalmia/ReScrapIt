import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { getMyOrders, getSellerOrders } from '../api/orders';
import { orderStatusColor, orderStatusLabel } from '../orderStatus';

export default function Orders() {
  const [tab, setTab] = useState('buying');
  const [buying, setBuying] = useState([]);
  const [selling, setSelling] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [b, s] = await Promise.all([getMyOrders(), getSellerOrders()]);
        setBuying(b.data.orders || []);
        setSelling(s.data.orders || []);
      } catch {
        setBuying([]); setSelling([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const list = tab === 'buying' ? buying : selling;

  const OrderRow = ({ order }) => {
    const counterparty = tab === 'buying' ? order.seller : order.buyer;
    const title = order.items?.[0]?.listing?.name || 'Order';
    return (
      <Link to={`/orders/${order._id}`} className="bg-white p-4 rounded-lg border flex items-center gap-4 hover:shadow-sm">
        <div className="h-14 w-14 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
          {order.items?.[0]?.listing?.images?.[0]
            ? <img src={order.items[0].listing.images[0]} alt={title} className="w-full h-full object-cover" />
            : <Package className="h-5 w-5 text-gray-300" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${orderStatusColor(order.status)}`}>{orderStatusLabel(order.status)}</span>
          </div>
          <div className="text-sm text-gray-500">
            {tab === 'buying' ? 'Seller' : 'Buyer'}: {counterparty?.name} · ₹{order.finalPrice?.toLocaleString('en-IN')}
          </div>
        </div>
        <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('buying')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'buying' ? 'bg-green-600 text-white' : 'bg-white border'}`}>
            Buying ({buying.length})
          </button>
          <button onClick={() => setTab('selling')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'selling' ? 'bg-green-600 text-white' : 'bg-white border'}`}>
            Selling ({selling.length})
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-gray-500">No orders here yet.</p>
        ) : (
          <div className="space-y-3">{list.map((o) => <OrderRow key={o._id} order={o} />)}</div>
        )}
      </div>
    </div>
  );
}
