import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/icon.png';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location  = useLocation();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState('');

  // Show success message if redirected from Register
  const registered = location.state?.registered;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      const role = result.user?.role;
      if (role === 'CITIZEN')     navigate('/dashboard/citizen');
      else if (role === 'AUTHORITY') navigate('/dashboard/organization');
      else if (role === 'ADMIN')   navigate('/dashboard/admin');
      else navigate('/dashboard');
    } else {
      // Show the exact error returned by the backend (e.g. "Account is deactivated")
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
      {/* Blobs */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,160,0.08) 0%, transparent 70%)', top: '-20%', left: '-15%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', bottom: '-15%', right: '-10%', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={logoImg} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.3rem', color: 'var(--txt-primary)' }}>
              Clean<span style={{ color: 'var(--clr-primary)' }}>My</span>City
            </span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--txt-primary)', marginTop: 28, marginBottom: 8 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem' }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-xl)', padding: 36, backdropFilter: 'blur(24px)' }}>

          {/* Registration success */}
          {registered && !error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(34,211,160,0.1)', border: '1px solid rgba(34,211,160,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
              <Info size={16} style={{ color: 'var(--clr-primary)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--clr-primary)' }}>Account created! Please sign in.</span>
            </motion.div>
          )}

          {/* Error banner */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
              <AlertCircle size={16} style={{ color: 'var(--clr-danger)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <span style={{ fontSize: '0.875rem', color: 'var(--clr-danger)', display: 'block' }}>{error}</span>
                {error.toLowerCase().includes('deactivat') && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)', marginTop: 4, display: 'block' }}>
                    Contact your administrator to activate your account.
                  </span>
                )}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <div className="field">
              <label>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
                <input
                  id="login-email"
                  type="email" required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  style={{ paddingLeft: 44 }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="field">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'} required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  style={{ paddingLeft: 44, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ width: '100%', marginTop: 4, height: 48, fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />
                  Signing in…
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  Sign In <ArrowRight size={16} />
                </span>
              )}
            </motion.button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--txt-secondary)', fontSize: '0.875rem', marginTop: 24 }}>
          New citizen?{' '}
          <Link to="/register" style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>Create a free account</Link>
        </p>
      </motion.div>
    </div>
  );
}
