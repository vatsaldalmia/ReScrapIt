import client from './client';

export const getCart = () => client.get('/api/cart');
export const addToCart = (listingId, quantity) => client.post('/api/cart', { listingId, quantity });
export const removeFromCart = (listingId) => client.delete(`/api/cart/${listingId}`);
export const clearCart = () => client.delete('/api/cart/clear');
