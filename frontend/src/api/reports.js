import client from './client';

export const createReport = (targetType, targetId, reason, description) =>
  client.post('/api/reports', { targetType, targetId, reason, description });
