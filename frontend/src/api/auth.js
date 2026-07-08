import client from './client';

export const signup = (payload) => client.post('/auth/signup', payload);

export const login = (payload) => client.post('/auth/login', payload);

export const getProfile = () => client.get('/auth/profile');

export const updateProfile = (payload) => client.put('/auth/profile', payload);

export const uploadKyc = (payload) => client.post('/auth/kyc', payload);
