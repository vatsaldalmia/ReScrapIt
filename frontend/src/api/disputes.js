import client from './client';

export const raiseDispute = (payload) => client.post('/api/disputes', payload);

export const getMyDisputes = () => client.get('/api/disputes/mine');
