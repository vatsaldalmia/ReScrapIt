import client from './client';

export const getNotifications = () => client.get('/api/notifications');

export const markRead = (id) => client.put(`/api/notifications/${id}/read`);

export const markAllRead = () => client.put('/api/notifications/read-all');
