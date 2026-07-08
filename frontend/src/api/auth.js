import client from './client';

export const signup = (payload) => client.post('/auth/signup', payload);

export const login = (payload) => client.post('/auth/login', payload);

export const getProfile = () => client.get('/auth/profile');

export const updateProfile = (payload) => client.put('/auth/profile', payload);

export const uploadKyc = (payload) => client.post('/auth/kyc', payload);

export const requestEmailVerification = () => client.post('/auth/verify-email/request');
export const confirmEmailVerification = (token) => client.post('/auth/verify-email/confirm', { token });
export const forgotPassword = (email) => client.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => client.post('/auth/reset-password', { token, password });
export const changePassword = (currentPassword, newPassword) => client.post('/auth/change-password', { currentPassword, newPassword });
export const requestOtp = () => client.post('/auth/otp/request');
export const verifyOtp = (code) => client.post('/auth/otp/verify', { code });
