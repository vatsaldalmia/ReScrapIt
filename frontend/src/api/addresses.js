import client from './client';

export const listAddresses = () => client.get('/api/addresses');
export const addAddress = (payload) => client.post('/api/addresses', payload);
export const updateAddress = (id, payload) => client.put(`/api/addresses/${id}`, payload);
export const deleteAddress = (id) => client.delete(`/api/addresses/${id}`);
