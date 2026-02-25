import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api, { fetchCsrfToken } from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cmc_user')); }
    catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('cmc_token') || null);
  const [loading, setLoading] = useState(false);

  // Initialize CSRF token on mount
  useEffect(() => {
    fetchCsrfToken();
  }, []);

  // Listen for 401 events from axiosInstance
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('cmc:unauthenticated', handler);
    return () => window.removeEventListener('cmc:unauthenticated', handler);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { token: t, user: u } = data.data;
      localStorage.setItem('cmc_token', t);
      localStorage.setItem('cmc_user', JSON.stringify(u));
      setToken(t);
      setUser(u);
      // Re-fetch CSRF token after login (session changed)
      await fetchCsrfToken();
      return { success: true, user: u };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      return { success: true, data: data.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { }
    localStorage.removeItem('cmc_token');
    localStorage.removeItem('cmc_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;
  const role = user?.role || null; // 'CITIZEN' | 'ORGANIZATION' | 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, role, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
