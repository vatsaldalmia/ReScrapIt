import { useEffect, useState } from 'react';
import { BadgeCheck, ShieldAlert, Upload, Mail, Phone, Lock, MapPin, Trash2, Star } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  updateProfile, uploadKyc, requestEmailVerification, requestOtp, verifyOtp, changePassword,
} from '../api/auth';
import { listAddresses, addAddress, deleteAddress, updateAddress } from '../api/addresses';

const fileToBase64 = (file) => new Promise((res) => {
  const reader = new FileReader();
  reader.onloadend = () => res(reader.result);
  reader.readAsDataURL(file);
});

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phoneNumber: user?.phoneNumber || '', address: user?.address || '',
    companyName: user?.companyName || '', gst: user?.gst || '', bio: user?.bio || '', role: user?.role || 'dual', logo: user?.logo || '',
  });
  const [msg, setMsg] = useState('');
  const [kycType, setKycType] = useState('pan_card');
  const [devLink, setDevLink] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pw, setPw] = useState({ current: '', next: '' });
  const [addresses, setAddresses] = useState([]);
  const [newAddr, setNewAddr] = useState({ label: '', city: '', state: '', pincode: '', address: '' });

  const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500';
  const label = 'block text-sm font-medium text-gray-700 mb-1';
  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const loadAddresses = async () => {
    try { setAddresses((await listAddresses()).data.addresses); } catch { /* ignore */ }
  };
  useEffect(() => { loadAddresses(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    try { const { data } = await updateProfile(form); updateUser(data); setMsg('Profile updated.'); }
    catch (err) { setMsg(err.response?.data?.message || 'Update failed.'); }
  };

  const handleLogo = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const b64 = await fileToBase64(file);
    const { data } = await updateProfile({ ...form, logo: b64 });
    updateUser(data); set('logo', b64); setMsg('Logo updated.');
  };

  const handleKyc = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const b64 = await fileToBase64(file);
    const { data } = await uploadKyc({ type: kycType, url: b64 });
    updateUser(data); setMsg('KYC document uploaded. Awaiting review.');
  };

  const sendVerifyEmail = async () => {
    setDevLink(''); setMsg('');
    const { data } = await requestEmailVerification();
    setMsg('Verification email sent.');
    if (data.devToken) setDevLink(`/verify-email?token=${data.devToken}`);
  };

  const sendOtp = async () => {
    const { data } = await requestOtp();
    setOtpSent(true);
    setMsg(data.devCode ? `Dev OTP: ${data.devCode}` : 'OTP sent to your phone.');
  };
  const confirmOtp = async () => {
    try { await verifyOtp(otpCode); updateUser({ ...user, phoneVerified: true }); setMsg('Phone verified.'); setOtpSent(false); }
    catch (err) { setMsg(err.response?.data?.message || 'OTP verification failed.'); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    try { await changePassword(pw.current, pw.next); setPw({ current: '', next: '' }); setMsg('Password changed.'); }
    catch (err) { setMsg(err.response?.data?.message || 'Password change failed.'); }
  };

  const createAddress = async (e) => {
    e.preventDefault();
    await addAddress(newAddr);
    setNewAddr({ label: '', city: '', state: '', pincode: '', address: '' });
    loadAddresses();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">Account Settings</h1>
          {user?.isVerified
            ? <span className="flex items-center gap-1 text-sm text-green-700 bg-green-50 px-2 py-1 rounded-full"><BadgeCheck className="h-4 w-4" /> Verified</span>
            : <span className="flex items-center gap-1 text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded-full"><ShieldAlert className="h-4 w-4" /> Not verified</span>}
          {user?.emailVerified && <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">Email ✓</span>}
          {user?.phoneVerified && <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">Phone ✓</span>}
        </div>

        {msg && <div className="text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">{msg}{devLink && <> — <a className="underline" href={devLink}>open verify link</a></>}</div>}

        {/* Profile */}
        <form onSubmit={save} className="bg-white p-6 rounded-lg border space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
              {form.logo ? <img src={form.logo} alt="logo" className="w-full h-full object-cover" /> : <Star className="h-6 w-6 text-green-600" />}
            </div>
            <label className="text-sm text-green-700 border border-green-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-green-50">
              Upload logo
              <input type="file" className="sr-only" accept="image/*" onChange={handleLogo} />
            </label>
          </div>
          <h2 className="font-semibold">Profile</h2>
          <div><label className={label}>Name</label><input className={input} value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={label}>Phone</label><input className={input} value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} /></div>
            <div>
              <label className={label}>Account type</label>
              <select className={input} value={form.role} onChange={(e) => set('role', e.target.value)}>
                <option value="buyer">Buyer</option><option value="seller">Seller</option><option value="dual">Both</option>
              </select>
            </div>
          </div>
          <div><label className={label}>Address</label><input className={input} value={form.address} onChange={(e) => set('address', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={label}>Company name</label><input className={input} value={form.companyName} onChange={(e) => set('companyName', e.target.value)} /></div>
            <div><label className={label}>GST number</label><input className={input} value={form.gst} onChange={(e) => set('gst', e.target.value)} /></div>
          </div>
          <div><label className={label}>Bio</label><textarea rows={2} className={input} value={form.bio} onChange={(e) => set('bio', e.target.value)} /></div>
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700">Save changes</button>
        </form>

        {/* Verification */}
        <div className="bg-white p-6 rounded-lg border space-y-3">
          <h2 className="font-semibold">Verification</h2>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-500" />
            {user?.emailVerified ? <span className="text-sm text-green-700">Email verified</span> : (
              <button onClick={sendVerifyEmail} className="text-sm border px-3 py-1.5 rounded-lg hover:bg-gray-50">Send verification email</button>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Phone className="h-5 w-5 text-gray-500" />
            {user?.phoneVerified ? <span className="text-sm text-green-700">Phone verified</span> : otpSent ? (
              <>
                <input className={input + ' max-w-[140px]'} placeholder="6-digit OTP" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
                <button onClick={confirmOtp} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">Verify OTP</button>
              </>
            ) : (
              <button onClick={sendOtp} className="text-sm border px-3 py-1.5 rounded-lg hover:bg-gray-50">Send phone OTP</button>
            )}
          </div>
        </div>

        {/* KYC */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="font-semibold mb-1">KYC documents</h2>
          <p className="text-sm text-gray-500 mb-4">Upload documents to get a verified badge.</p>
          <div className="flex items-center gap-3">
            <select className={input + ' max-w-[200px]'} value={kycType} onChange={(e) => setKycType(e.target.value)}>
              <option value="pan_card">PAN Card</option><option value="gst_certificate">GST Certificate</option><option value="other">Other</option>
            </select>
            <label className="flex items-center gap-2 border px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
              <Upload className="h-4 w-4" /> Upload
              <input type="file" className="sr-only" accept="image/*,application/pdf" onChange={handleKyc} />
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

        {/* Change password */}
        <form onSubmit={savePassword} className="bg-white p-6 rounded-lg border space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><Lock className="h-4 w-4" /> Change password</h2>
          <input type="password" className={input} placeholder="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
          <input type="password" className={input} placeholder="New password (min 8 chars)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required />
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700">Update password</button>
        </form>

        {/* Address book */}
        <div className="bg-white p-6 rounded-lg border space-y-3">
          <h2 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" /> Address book</h2>
          {addresses.map((a) => (
            <div key={a._id} className="flex items-center gap-3 text-sm border rounded-lg px-3 py-2">
              <div className="flex-1">
                <span className="font-medium">{a.label}</span> {a.isDefault && <span className="text-xs bg-green-50 text-green-700 px-2 rounded-full">default</span>}
                <div className="text-gray-500">{[a.address, a.city, a.state, a.pincode].filter(Boolean).join(', ')}</div>
              </div>
              {!a.isDefault && <button onClick={async () => { await updateAddress(a._id, { isDefault: true }); loadAddresses(); }} className="text-xs text-green-700 hover:underline">Set default</button>}
              <button onClick={async () => { await deleteAddress(a._id); loadAddresses(); }} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <form onSubmit={createAddress} className="grid grid-cols-2 gap-2">
            <input className={input} placeholder="Label" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} />
            <input className={input} placeholder="City" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} />
            <input className={input} placeholder="State" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} />
            <input className={input} placeholder="Pincode" value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} />
            <input className={input + ' col-span-2'} placeholder="Address" value={newAddr.address} onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })} />
            <button type="submit" className="col-span-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Add address</button>
          </form>
        </div>
      </div>
    </div>
  );
}
