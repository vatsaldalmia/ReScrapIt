import client from './client';

export const getMyOrders = () => client.get('/api/orders/my-orders');

export const getSellerOrders = () => client.get('/api/orders/seller-orders');

export const getOrder = (id) => client.get(`/api/orders/${id}`);

export const updateOrderStatus = (id, status, note) =>
  client.put(`/api/orders/${id}/status`, { status, note });

export const payOrder = (id, paymentId) =>
  client.post(`/api/orders/${id}/pay`, { paymentId });

export const addDeliveryProof = (id, images, signature) =>
  client.post(`/api/orders/${id}/delivery-proof`, { images, signature });

export const createPayment = (id) => client.post(`/api/orders/${id}/pay/create`);
export const verifyPayment = (id, payload) => client.post(`/api/orders/${id}/pay/verify`, payload);
export const refundOrder = (id) => client.post(`/api/orders/${id}/refund`);
export const verifyWeight = (id, actualWeight) => client.post(`/api/orders/${id}/weight`, { actualWeight });
export const getInvoice = (id) => client.get(`/api/orders/${id}/invoice`);
export const getTransactions = () => client.get('/api/orders/transactions');
