import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cmc_user'));
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('cmc_token') || null);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     INITIAL CSRF COOKIE INIT
  ===================================================== */
  useEffect(() => {
    const init = async () => {
      try {
        // This initializes the XSRF-TOKEN cookie; Axios will
        // read it automatically and send it in X-CSRF-Token.
        await api.get('/csrf-token');
      } catch (err) {
        console.error('Failed to initialize CSRF protection', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /* =====================================================
     AUTO LOGOUT ON 401
  ===================================================== */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) { }

    localStorage.removeItem('cmc_token');
    localStorage.removeItem('cmc_user');

    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('cmc:unauthenticated', handler);
    return () => window.removeEventListener('cmc:unauthenticated', handler);
  }, [logout]);

  /* =====================================================
     LOGIN
  ===================================================== */
  const login = useCallback(async (email, password) => {
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });

      const { token: t, user: u } = data.data;

      localStorage.setItem('cmc_token', t);
      localStorage.setItem('cmc_user', JSON.stringify(u));

      setToken(t);
      setUser(u);

      return { success: true, user: u };

    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  /* =====================================================
     REGISTER
  ===================================================== */
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

  const isAuthenticated = !!token && !!user;
  const role = user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        role,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}