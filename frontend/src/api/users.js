import client from './client';

export const getPublicUser = (id) => client.get(`/api/users/${id}`);
