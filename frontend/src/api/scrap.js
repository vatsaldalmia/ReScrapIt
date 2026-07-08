import client from './client';

export const searchScraps = (query) =>
  client.get('/api/scrap/search', { params: { query } });

export const browseScraps = (params) =>
  client.get('/api/scrap', { params });

export const getScrap = (id) => client.get(`/api/scrap/${id}`);

export const addScrap = (payload) => client.post('/api/scrap/add', payload);

export const updateScrap = (id, payload) => client.put(`/api/scrap/${id}`, payload);

export const deleteScrap = (id) => client.delete(`/api/scrap/delete/${id}`);

export const getMyListings = () => client.get('/api/scrap/my-listings');

export const getSellerListings = (sellerId) =>
  client.get(`/api/scrap/seller/${sellerId}`);

export const getFeatured = () => client.get('/api/scrap/featured');

export const getTrending = () => client.get('/api/scrap/trending');
