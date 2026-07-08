export const ORDER_STATUS_LABELS = {
  quote_accepted: 'Quote Accepted',
  payment_pending: 'Payment Pending',
  paid: 'Paid',
  pickup_scheduled: 'Pickup Scheduled',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
  reviewed: 'Reviewed',
};

export const ORDER_STATUS_COLORS = {
  quote_accepted: 'bg-blue-50 text-blue-700',
  payment_pending: 'bg-yellow-50 text-yellow-700',
  paid: 'bg-green-50 text-green-700',
  pickup_scheduled: 'bg-indigo-50 text-indigo-700',
  in_transit: 'bg-purple-50 text-purple-700',
  delivered: 'bg-teal-50 text-teal-700',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-50 text-red-600',
  disputed: 'bg-orange-50 text-orange-700',
  reviewed: 'bg-gray-100 text-gray-600',
};

export const orderStatusLabel = (s) => ORDER_STATUS_LABELS[s] || s;
export const orderStatusColor = (s) => ORDER_STATUS_COLORS[s] || 'bg-gray-100 text-gray-600';
