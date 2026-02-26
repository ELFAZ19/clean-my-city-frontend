import axios from 'axios';

/* =====================================================
   AXIOS INSTANCE
===================================================== */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // REQUIRED for cross-origin cookies
  timeout: 15000,
});

/* =====================================================
   CSRF TOKEN STATE
===================================================== */

let csrfToken = null;
let csrfPromise = null;

/**
 * Fetch CSRF token from backend.
 * Uses a single in-flight promise to prevent race conditions.
 */
export const fetchCsrfToken = async () => {
  if (csrfPromise) return csrfPromise;

  csrfPromise = api
    .get('/csrf-token')
    .then((res) => {
      csrfToken = res.data.csrfToken;
      return csrfToken;
    })
    .catch((err) => {
      console.warn('CSRF token fetch failed:', err?.message);
      csrfToken = null;
      throw err;
    })
    .finally(() => {
      csrfPromise = null;
    });

  return csrfPromise;
};

/* =====================================================
   REQUEST INTERCEPTOR
===================================================== */

api.interceptors.request.use(
  async (config) => {
    const mutatingMethods = ['post', 'put', 'delete', 'patch'];

    // Ensure CSRF token exists before mutating requests
    if (mutatingMethods.includes(config.method)) {
      if (!csrfToken) {
        try {
          await fetchCsrfToken();
        } catch (_) {}
      }

      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    // Attach JWT if exists (hybrid auth support)
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

    // 🛡 Handle CSRF failure (EBADCSRFTOKEN from backend)
    if (status === 403) {
      try {
        await fetchCsrfToken();
      } catch (_) {}
    }

    return Promise.reject(error);
  }
);

export default api;