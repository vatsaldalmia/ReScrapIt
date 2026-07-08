import client from './client';

export const getChats = () => client.get('/api/chat/getchat');

export const createChat = (user2) =>
  client.post('/api/chat/createchat', { user2 });

export const getMessages = (chatId) =>
  client.get(`/api/message/get/${chatId}`);

export const sendMessage = (chatId, text) =>
  client.post('/api/message/send', { chatId, text });

export const sendMedia = (chatId, media, text) =>
  client.post('/api/message/send', { chatId, media, text });

export const markSeen = (chatId) => client.put(`/api/message/seen/${chatId}`);

export const blockUser = (userId) => client.post('/api/chat/block', { userId });
