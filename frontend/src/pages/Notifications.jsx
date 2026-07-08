import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { getNotifications, markRead, markAllRead } from '../api/notifications';

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await getNotifications();
      setItems(data.notifications || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const open = async (n) => {
    if (!n.read) {
      try { await markRead(n._id); } catch { /* ignore */ }
    }
    if (n.link) navigate(n.link);
    else load();
  };

  const clearAll = async () => {
    await markAllRead();
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="h-6 w-6 text-green-600" /> Notifications</h1>
          {items.some((n) => !n.read) && (
            <button onClick={clearAll} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">You have no notifications.</p>
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <button
                key={n._id}
                onClick={() => open(n)}
                className={`w-full text-left p-4 rounded-lg border flex items-start gap-3 ${n.read ? 'bg-white' : 'bg-green-50 border-green-200'}`}
              >
                {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-green-500 shrink-0" />}
                <div className="flex-1">
                  <div className="font-medium text-sm">{n.title}</div>
                  {n.body && <div className="text-sm text-gray-600">{n.body}</div>}
                  <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
