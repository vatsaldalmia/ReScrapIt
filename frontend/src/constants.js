export const CATEGORIES = [
  { value: 'metal', label: 'Metal' },
  { value: 'plastic', label: 'Plastic' },
  { value: 'e_waste', label: 'E-Waste' },
  { value: 'paper', label: 'Paper' },
  { value: 'glass', label: 'Glass' },
  { value: 'chemical', label: 'Chemical' },
  { value: 'other', label: 'Other' },
];

export const PRICE_UNITS = [
  { value: 'per_kg', label: '₹ / kg' },
  { value: 'per_ton', label: '₹ / ton' },
  { value: 'per_lot', label: '₹ / lot' },
  { value: 'negotiable', label: 'Negotiable' },
];

export const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'sold', label: 'Sold' },
  { value: 'expired', label: 'Expired' },
];

export const categoryLabel = (v) => CATEGORIES.find((c) => c.value === v)?.label || v;
export const priceUnitLabel = (v) => PRICE_UNITS.find((p) => p.value === v)?.label || v;

export const formatPrice = (price, unit) => {
  if (!price || unit === 'negotiable') return 'Negotiable';
  return `₹${Number(price).toLocaleString('en-IN')} ${priceUnitLabel(unit)}`;
};
