import { useEffect, useState } from 'react';
import { Users, Package, ShoppingBag, AlertTriangle, IndianRupee, BadgeCheck, Ban } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { orderStatusColor, orderStatusLabel } from '../orderStatus';
import * as admin from '../api/admin';

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Icon className="h-4 w-4" /> {label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [reports, setReports] = useState([]);

  const loadOverview = async () => {
    const { data } = await admin.getAnalytics();
    setAnalytics(data.analytics);
  };
  const loadUsers = async () => setUsers((await admin.getUsers()).data.users);
  const loadListings = async () => setListings((await admin.getListings()).data.listings);
  const loadOrders = async () => setOrders((await admin.getOrders()).data.orders);
  const loadDisputes = async () => setDisputes((await admin.getDisputes()).data.disputes);
  const loadReports = async () => setReports((await admin.getReports()).data.reports);

  useEffect(() => {
    const loaders = { overview: loadOverview, users: loadUsers, listings: loadListings, orders: loadOrders, disputes: loadDisputes, reports: loadReports };
    loaders[tab]?.().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const verify = async (id) => { await admin.verifyUser(id); loadUsers(); };
  const ban = async (id) => { await admin.banUser(id); loadUsers(); };
  const resolve = async (id, status) => {
    const notes = window.prompt('Resolution notes (optional):') || '';
    await admin.resolveDispute(id, status, notes);
    loadDisputes();
  };
  const moderate = async (id, payload) => { await admin.moderateListing(id, payload); loadListings(); };
  const resolveRep = async (id, action) => { await admin.resolveReport(id, undefined, action); loadReports(); };

  const tabs = [
    ['overview', 'Overview'], ['users', 'Users'], ['listings', 'Listings'], ['orders', 'Orders'], ['disputes', 'Disputes'], ['reports', 'Reports'],
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === k ? 'bg-green-600 text-white' : 'bg-white border'}`}>{label}</button>
          ))}
        </div>

        {tab === 'overview' && analytics && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Stat icon={Users} label="Users" value={analytics.users} />
            <Stat icon={Package} label="Listings" value={analytics.listings} />
            <Stat icon={ShoppingBag} label="Orders" value={analytics.orders} />
            <Stat icon={IndianRupee} label="GMV" value={`₹${analytics.gmv?.toLocaleString('en-IN')}`} />
            <Stat icon={ShoppingBag} label="Paid orders" value={analytics.paidOrders} />
            <Stat icon={AlertTriangle} label="Open disputes" value={analytics.openDisputes} />
          </div>
        )}

        {tab === 'users' && (
          <div className="bg-white rounded-lg border divide-y">
            {users.map((u) => (
              <div key={u._id} className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium flex items-center gap-2">
                    {u.name}
                    {u.isVerified && <BadgeCheck className="h-4 w-4 text-green-600" />}
                    {u.banned && <span className="text-xs bg-red-50 text-red-600 px-2 rounded-full">banned</span>}
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 rounded-full">{u.role}</span>
                  </div>
                  <div className="text-sm text-gray-500">{u.email} · {u.companyName || 'No company'}</div>
                </div>
                {!u.isVerified && <button onClick={() => verify(u._id)} className="text-sm text-green-700 border border-green-200 px-3 py-1 rounded-lg hover:bg-green-50">Verify</button>}
                {u.role !== 'admin' && (
                  <button onClick={() => ban(u._id)} className="flex items-center gap-1 text-sm text-red-600 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50">
                    <Ban className="h-3.5 w-3.5" /> {u.banned ? 'Unban' : 'Ban'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'listings' && (
          <div className="bg-white rounded-lg border divide-y">
            {listings.map((l) => (
              <div key={l._id} className="p-3 flex items-center gap-3">
                <div className="flex-1"><span className="font-medium">{l.name}</span> <span className="text-sm text-gray-500">by {l.seller?.name}</span></div>
                {l.featured && <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">featured</span>}
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{l.moderationStatus}</span>
                <button onClick={() => moderate(l._id, { featured: !l.featured })} className="text-xs border px-2 py-1 rounded-lg hover:bg-gray-50">{l.featured ? 'Unfeature' : 'Feature'}</button>
                <button onClick={() => moderate(l._id, { moderationStatus: 'approved' })} className="text-xs text-green-700 border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50">Approve</button>
                <button onClick={() => moderate(l._id, { moderationStatus: 'rejected' })} className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50">Reject</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'orders' && (
          <div className="bg-white rounded-lg border divide-y">
            {orders.map((o) => (
              <div key={o._id} className="p-3 flex items-center gap-3">
                <div className="flex-1 text-sm">#{o._id.slice(-6)} · {o.buyer?.name} → {o.seller?.name} · ₹{o.finalPrice?.toLocaleString('en-IN')}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${orderStatusColor(o.status)}`}>{orderStatusLabel(o.status)}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'disputes' && (
          <div className="space-y-3">
            {disputes.length === 0 && <p className="text-gray-500">No disputes.</p>}
            {disputes.map((d) => (
              <div key={d._id} className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{d.reason}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">{d.status}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">Raised by {d.raisedBy?.name} · Order ₹{d.order?.finalPrice?.toLocaleString('en-IN')}</div>
                {d.description && <p className="text-sm text-gray-600 mt-1">{d.description}</p>}
                {['open', 'under_review'].includes(d.status) && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => resolve(d._id, 'resolved_buyer')} className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">Resolve for buyer</button>
                    <button onClick={() => resolve(d._id, 'resolved_seller')} className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">Resolve for seller</button>
                    <button onClick={() => resolve(d._id, 'under_review')} className="text-sm border px-3 py-1 rounded-lg hover:bg-gray-50">Mark under review</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {tab === 'reports' && (
          <div className="space-y-3">
            {reports.length === 0 && <p className="text-gray-500">No reports.</p>}
            {reports.map((rp) => (
              <div key={rp._id} className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="font-medium capitalize">{rp.targetType} report: {rp.reason}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{rp.status}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">By {rp.reporter?.name} · {new Date(rp.createdAt).toLocaleDateString('en-IN')}</div>
                {rp.description && <p className="text-sm text-gray-600 mt-1">{rp.description}</p>}
                {rp.status === 'open' && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {rp.targetType === 'review' && <button onClick={() => resolveRep(rp._id, 'hide_review')} className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">Hide review</button>}
                    {rp.targetType === 'listing' && <button onClick={() => resolveRep(rp._id, 'reject_listing')} className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700">Reject listing</button>}
                    {rp.targetType === 'user' && <button onClick={() => resolveRep(rp._id, 'ban_user')} className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700">Ban user</button>}
                    <button onClick={async () => { await admin.resolveReport(rp._id, 'dismissed'); loadReports(); }} className="text-sm border px-3 py-1 rounded-lg hover:bg-gray-50">Dismiss</button>
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
