import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/habits`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('streakly_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getHabits = () => api.get('/').then((res) => res.data);

export const createHabit = (habit) => api.post('/', habit).then((res) => res.data);

export const updateHabit = (id, changes) => api.put(`/${id}`, changes).then((res) => res.data);

export const deleteHabit = (id) => api.delete(`/${id}`).then((res) => res.data);

export const toggleHabit = (id, date) =>
  api.patch(`/${id}/toggle`, { date }).then((res) => res.data);

export const reorderHabits = (ids) => api.put('/reorder', { ids }).then((res) => res.data);

export const exportHabits = () => api.get('/export').then((res) => res.data);

export const importHabits = (data) => api.post('/import', data).then((res) => res.data);

export const saveNote = (id, date, text) =>
  api.put(`/${id}/note`, { date, text }).then((res) => res.data);
