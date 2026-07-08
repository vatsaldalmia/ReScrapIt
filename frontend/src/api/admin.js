import client from './client';

export const getUsers = () => client.get('/api/admin/users');
export const verifyUser = (id) => client.put(`/api/admin/users/${id}/verify`);
export const banUser = (id) => client.put(`/api/admin/users/${id}/ban`);
export const getListings = () => client.get('/api/admin/listings');
export const getOrders = () => client.get('/api/admin/orders');
export const getDisputes = () => client.get('/api/admin/disputes');
export const resolveDispute = (id, status, adminNotes) =>
  client.put(`/api/admin/disputes/${id}/resolve`, { status, adminNotes });
export const getAnalytics = () => client.get('/api/admin/analytics');
export const moderateListing = (id, payload) => client.put(`/api/admin/listings/${id}/moderate`, payload);
export const moderateReview = (id, hidden) => client.put(`/api/admin/reviews/${id}/moderate`, { hidden });
export const getReports = () => client.get('/api/admin/reports');
export const resolveReport = (id, status, action) => client.put(`/api/admin/reports/${id}/resolve`, { status, action });
