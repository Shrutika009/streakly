import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('streakly_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (userData) => api.post('/register', userData).then((res) => res.data);

export const login = (credentials) => api.post('/login', credentials).then((res) => res.data);

export const getMe = () => api.get('/me').then((res) => res.data);

export const updateProfile = (changes) => api.put('/me', changes).then((res) => res.data);

export const changePassword = (passwords) =>
  api.put('/me/password', passwords).then((res) => res.data);

export const deleteAccount = (password) =>
  api.delete('/me', { data: { password } }).then((res) => res.data);
