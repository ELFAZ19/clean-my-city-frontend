import axios from 'axios';

/* =====================================================
   AXIOS INSTANCE
===================================================== */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // REQUIRED for cross-origin cookies
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-CSRF-Token',
  timeout: 15000,
});

/* =====================================================
   REQUEST INTERCEPTOR
===================================================== */

api.interceptors.request.use(
  async (config) => {
    // Attach JWT if exists
    const token = localStorage.getItem('cmc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =====================================================
   RESPONSE INTERCEPTOR
===================================================== */

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    // 🔐 Handle Unauthorized
    if (status === 401) {
      localStorage.removeItem('cmc_token');
      localStorage.removeItem('cmc_user');
      window.dispatchEvent(new Event('cmc:unauthenticated'));
    }

    return Promise.reject(error);
  }
);

export default api;