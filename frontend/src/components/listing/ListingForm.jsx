import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { CATEGORIES, PRICE_UNITS, STATUSES } from '../../constants';
import { uploadImages } from '../../api/upload';

const empty = {
  name: '',
  description: '',
  quantity: '',
  price: '',
  priceUnit: 'negotiable',
  category: 'other',
  moq: '',
  status: 'active',
  location: { city: '', state: '', pincode: '', address: '' },
  images: [],
};

export default function ListingForm({ initial, submitLabel = 'Save', onSubmit, showStatus = false }) {
  const [form, setForm] = useState({ ...empty, ...initial, location: { ...empty.location, ...(initial?.location || {}) } });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setLoc = (key, value) => setForm((prev) => ({ ...prev, location: { ...prev.location, [key]: value } }));

  const handleImages = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => set('images', [...form.images, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (i) => set('images', form.images.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.description || form.quantity === '') {
      setError('Name, description and quantity are required.');
      return;
    }
    setSaving(true);
    try {
      let images = form.images;
      // Upload any raw base64 data URIs; keep already-hosted URLs as-is.
      const rawImages = images.filter((img) => img.startsWith('data:'));
      if (rawImages.length > 0) {
        const { data } = await uploadImages(rawImages);
        const uploaded = data.urls || rawImages;
        const hosted = images.filter((img) => !img.startsWith('data:'));
        images = [...hosted, ...uploaded];
      }

      await onSubmit({
        name: form.name,
        description: form.description,
        quantity: Number(form.quantity),
        price: form.price === '' ? 0 : Number(form.price),
        priceUnit: form.priceUnit,
        category: form.category,
        moq: form.moq === '' ? 1 : Number(form.moq),
        status: form.status,
        location: form.location,
        images,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent';
  const label = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}

      <div>
        <label className={label}>Images</label>
        {form.images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt={`preview ${i + 1}`} className="w-full h-24 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="flex justify-center px-6 py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-green-400">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <span className="text-sm text-green-600 font-medium">Upload images</span>
            <input type="file" className="sr-only" accept="image/*" multiple onChange={handleImages} />
          </div>
        </label>
      </div>

      <div>
        <label className={label}>Product Name *</label>
        <input className={input} value={form.name} onChange={(e) => set('name', e.target.value)} required />
      </div>

      <div>
        <label className={label}>Description *</label>
        <textarea className={input} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Quantity *</label>
          <input type="number" step="0.01" className={input} value={form.quantity} onChange={(e) => set('quantity', e.target.value)} required />
        </div>
        <div>
          <label className={label}>Category</label>
          <select className={input} value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={label}>Price</label>
          <input type="number" step="0.01" className={input} value={form.price} onChange={(e) => set('price', e.target.value)} />
        </div>
        <div>
          <label className={label}>Price Unit</label>
          <select className={input} value={form.priceUnit} onChange={(e) => set('priceUnit', e.target.value)}>
            {PRICE_UNITS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>MOQ</label>
          <input type="number" step="0.01" className={input} value={form.moq} onChange={(e) => set('moq', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>City</label>
          <input className={input} value={form.location.city} onChange={(e) => setLoc('city', e.target.value)} />
        </div>
        <div>
          <label className={label}>State</label>
          <input className={input} value={form.location.state} onChange={(e) => setLoc('state', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Pincode</label>
          <input className={input} value={form.location.pincode} onChange={(e) => setLoc('pincode', e.target.value)} />
        </div>
        <div>
          <label className={label}>Pickup Address</label>
          <input className={input} value={form.location.address} onChange={(e) => setLoc('address', e.target.value)} />
        </div>
      </div>

      {showStatus && (
        <div>
          <label className={label}>Status</label>
          <select className={input} value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60"
      >
        {saving ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
