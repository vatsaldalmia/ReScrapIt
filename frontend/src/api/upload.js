import client from './client';

// Uploads an array of base64 data URIs and returns the resulting URLs.
export const uploadImages = (images) =>
  client.post('/api/upload/image', { images });
