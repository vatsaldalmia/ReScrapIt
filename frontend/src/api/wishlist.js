import client from './client';

export const getWishlist = () => client.get('/api/wishlist');
export const toggleWishlist = (listingId) => client.post('/api/wishlist/toggle', { listingId });
