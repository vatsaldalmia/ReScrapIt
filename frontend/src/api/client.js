import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const client = axios.create({
  baseURL: API_URL,
});

// Attach the JWT to every request when present.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear stale auth so the app can redirect to login.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default client;
