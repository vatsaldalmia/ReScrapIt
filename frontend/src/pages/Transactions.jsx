import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { getTransactions } from '../api/orders';

export default function Transactions() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getTransactions();
        setTxs(data.transactions || []);
      } catch {
        setTxs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const escrowColor = {
    held: 'bg-yellow-50 text-yellow-700',
    released: 'bg-green-50 text-green-700',
    refunded: 'bg-red-50 text-red-600',
    none: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6"><Receipt className="h-6 w-6 text-green-600" /> Transactions</h1>
        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : txs.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {txs.map((t, i) => (
              <Link to={`/orders/${t.orderId}`} key={i} className="bg-white p-4 rounded-lg border flex items-center gap-3 hover:shadow-sm">
                {t.role === 'payout' ? <ArrowDownLeft className="h-5 w-5 text-green-600" /> : <ArrowUpRight className="h-5 w-5 text-blue-600" />}
                <div className="flex-1">
                  <div className="font-medium text-sm">{t.role === 'payout' ? 'Payout' : 'Payment'} · {t.counterparty}</div>
                  <div className="text-xs text-gray-400">{new Date(t.date).toLocaleString('en-IN')} · #{String(t.orderId).slice(-6)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{(t.net ?? t.amount)?.toLocaleString('en-IN')}</div>
                  {t.role === 'payout' && t.platformFee ? <div className="text-xs text-gray-400">fee ₹{t.platformFee}</div> : null}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${escrowColor[t.escrowStatus] || ''}`}>{t.escrowStatus}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
