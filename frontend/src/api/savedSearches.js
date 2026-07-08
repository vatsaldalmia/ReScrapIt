import client from './client';

export const createSavedSearch = (name, params) => client.post('/api/saved-searches', { name, params });
export const getSavedSearches = () => client.get('/api/saved-searches');
export const deleteSavedSearch = (id) => client.delete(`/api/saved-searches/${id}`);
