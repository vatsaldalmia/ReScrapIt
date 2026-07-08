import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Package, ShoppingCart } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { getCart, removeFromCart, clearCart } from '../api/cart';
import { formatPrice } from '../constants';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await getCart();
      setItems(data.cart.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => { await removeFromCart(id); load(); };
  const clear = async () => { await clearCart(); load(); };

  const subtotal = items.reduce((sum, i) => sum + (i.listing?.price || 0) * (i.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingCart className="h-6 w-6 text-green-600" /> Cart</h1>
          {items.length > 0 && <button onClick={clear} className="text-sm text-red-600 hover:underline">Clear cart</button>}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border">
            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Your cart is empty.</p>
            <Link to="/browse" className="text-green-600 font-medium hover:underline">Browse listings</Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.listing?._id} className="bg-white p-4 rounded-lg border flex items-center gap-4">
                  <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                    {it.listing?.images?.[0] ? <img src={it.listing.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="h-6 w-6 text-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/listing/${it.listing?._id}`} className="font-semibold hover:underline">{it.listing?.name}</Link>
                    <div className="text-sm text-gray-500">Qty {it.quantity} · {formatPrice(it.listing?.price, it.listing?.priceUnit)}</div>
                  </div>
                  <Link to={`/listing/${it.listing?._id}`} className="text-sm text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50">Make offer</Link>
                  <button onClick={() => remove(it.listing?._id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-white p-4 rounded-lg border flex items-center justify-between">
              <span className="text-gray-600">Estimated subtotal</span>
              <span className="text-xl font-bold text-green-700">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">B2B orders are placed by sending an offer on each listing; the cart helps you keep track.</p>
          </>
        )}
      </div>
    </div>
  );
}
