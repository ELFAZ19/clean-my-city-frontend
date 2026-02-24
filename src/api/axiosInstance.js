import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,        // send session cookies
  timeout: 15000,
});

// Attach JWT from localStorage on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cmc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Global 401 handler
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cmc_token');
      localStorage.removeItem('cmc_user');
      window.dispatchEvent(new Event('cmc:unauthenticated'));
    }
    return Promise.reject(error);
  },
);

export default api;
