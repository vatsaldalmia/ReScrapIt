import client from './client';

export const signup = (payload) => client.post('/auth/signup', payload);

export const login = (payload) => client.post('/auth/login', payload);

export const getProfile = () => client.get('/auth/profile');
