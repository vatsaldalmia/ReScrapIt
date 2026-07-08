import { useState } from 'react';
import { BadgeCheck, ShieldAlert, Upload } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { updateProfile, uploadKyc } from '../api/auth';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    companyName: user?.companyName || '',
    gst: user?.gst || '',
    bio: user?.bio || '',
    role: user?.role || 'dual',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [kycType, setKycType] = useState('pan_card');
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500';
  const label = 'block text-sm font-medium text-gray-700 mb-1';

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      const { data } = await updateProfile(form);
      updateUser(data);
      setMsg('Profile updated.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleKyc = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setMsg('');
    try {
      const base64 = await new Promise((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result);
        reader.readAsDataURL(file);
      });
      const { data } = await uploadKyc({ type: kycType, url: base64 });
      updateUser(data);
      setMsg('KYC document uploaded. Awaiting admin review.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold">Account Settings</h1>
          {user?.isVerified ? (
            <span className="flex items-center gap-1 text-sm text-green-700 bg-green-50 px-2 py-1 rounded-full">
              <BadgeCheck className="h-4 w-4" /> Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full">
              <ShieldAlert className="h-4 w-4" /> Not verified
            </span>
          )}
        </div>

        {msg && <div className="mb-4 text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">{msg}</div>}

        <form onSubmit={save} className="bg-white p-6 rounded-lg border space-y-4">
          <h2 className="font-semibold">Profile</h2>
          <div><label className={label}>Name</label><input className={input} value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={label}>Phone</label><input className={input} value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} /></div>
            <div>
              <label className={label}>Account type</label>
              <select className={input} value={form.role} onChange={(e) => set('role', e.target.value)}>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="dual">Both</option>
              </select>
            </div>
          </div>
          <div><label className={label}>Address</label><input className={input} value={form.address} onChange={(e) => set('address', e.target.value)} /></div>

          <h2 className="font-semibold pt-2">Business</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={label}>Company name</label><input className={input} value={form.companyName} onChange={(e) => set('companyName', e.target.value)} /></div>
            <div><label className={label}>GST number</label><input className={input} value={form.gst} onChange={(e) => set('gst', e.target.value)} /></div>
          </div>
          <div><label className={label}>Bio</label><textarea rows={3} className={input} value={form.bio} onChange={(e) => set('bio', e.target.value)} /></div>

          <button type="submit" disabled={saving} className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <div className="bg-white p-6 rounded-lg border mt-6">
          <h2 className="font-semibold mb-1">KYC verification</h2>
          <p className="text-sm text-gray-500 mb-4">Upload documents to get a verified badge. An admin will review them.</p>
          <div className="flex items-center gap-3">
            <select className={input + ' max-w-[200px]'} value={kycType} onChange={(e) => setKycType(e.target.value)}>
              <option value="pan_card">PAN Card</option>
              <option value="gst_certificate">GST Certificate</option>
              <option value="other">Other</option>
            </select>
            <label className="flex items-center gap-2 border px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
              <Upload className="h-4 w-4" /> {uploading ? 'Uploading…' : 'Upload document'}
              <input type="file" className="sr-only" accept="image/*,application/pdf" onChange={handleKyc} disabled={uploading} />
            </label>
          </div>
          {user?.kycDocuments?.length > 0 && (
            <ul className="mt-4 text-sm text-gray-600 space-y-1">
              {user.kycDocuments.map((d, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="capitalize">{d.type.replace('_', ' ')}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${d.status === 'approved' ? 'bg-green-50 text-green-700' : d.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'}`}>{d.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
