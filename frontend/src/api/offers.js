import client from './client';

export const createOffer = (payload) => client.post('/api/offers', payload);

export const getMyOffers = () => client.get('/api/offers');

export const respondOffer = (id, action, counterPrice) =>
  client.put(`/api/offers/${id}/respond`, { action, counterPrice });

export const confirmOffer = (id) => client.post(`/api/offers/${id}/confirm`);
