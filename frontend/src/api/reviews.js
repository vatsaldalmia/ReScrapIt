import client from './client';

export const createReview = (payload) => client.post('/api/reviews', payload);

export const getSellerReviews = (sellerId) =>
  client.get(`/api/reviews/seller/${sellerId}`);

export const getListingReviews = (listingId) =>
  client.get(`/api/reviews/listing/${listingId}`);

export const respondReview = (id, text) =>
  client.put(`/api/reviews/${id}/respond`, { text });

export const toggleHelpful = (id) => client.post(`/api/reviews/${id}/helpful`);
