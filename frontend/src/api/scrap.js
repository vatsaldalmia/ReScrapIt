import client from './client';

export const searchScraps = (query) =>
  client.get('/api/scrap/search', { params: { query } });

export const addScrap = (payload) => client.post('/api/scrap/add', payload);

export const deleteScrap = (id) => client.delete(`/api/scrap/delete/${id}`);
