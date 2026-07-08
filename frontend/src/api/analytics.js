import client from './client';

export const getMyAnalytics = () => client.get('/api/analytics/me');
