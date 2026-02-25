import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,        // send session cookies automatically
  timeout: 15000,
});

// ============================================
// CSRF Token Management
// ============================================
let csrfToken = null;

/**
 * Fetch CSRF token from backend.
 * Called once on app init and cached for subsequent requests.
 */
export const fetchCsrfToken = async () => {
  try {
    const { data } = await api.get('/csrf-token');
    csrfToken = data.csrfToken;
  } catch (err) {
    console.warn('Could not fetch CSRF token:', err.message);
  }
};

// Attach CSRF token to every mutating request (POST, PUT, DELETE, PATCH)
api.interceptors.request.use(
  (config) => {
    const mutatingMethods = ['post', 'put', 'delete', 'patch'];
    if (csrfToken && mutatingMethods.includes(config.method)) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    // Also attach JWT from localStorage as fallback for backward compatibility
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
    // If CSRF token is invalid, refetch it
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
      fetchCsrfToken();
    }
    return Promise.reject(error);
  },
);

export default api;
