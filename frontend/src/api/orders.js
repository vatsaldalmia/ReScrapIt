import client from './client';

export const getMyOrders = () => client.get('/api/orders/my-orders');

export const getSellerOrders = () => client.get('/api/orders/seller-orders');

export const getOrder = (id) => client.get(`/api/orders/${id}`);

export const updateOrderStatus = (id, status, note) =>
  client.put(`/api/orders/${id}/status`, { status, note });

export const payOrder = (id, paymentId) =>
  client.post(`/api/orders/${id}/pay`, { paymentId });

export const addDeliveryProof = (id, images) =>
  client.post(`/api/orders/${id}/delivery-proof`, { images });
