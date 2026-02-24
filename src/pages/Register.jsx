import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/icon.png';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    const payload = { full_name: form.full_name, email: form.email, phone: form.phone, password: form.password, role: 'CITIZEN' };
    const result = await register(payload);
    if (result.success) {
      navigate('/login', { state: { registered: true } });
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-base)', position: 'relative', overflow: 'hidden' }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)', top: '-20%', right: '-15%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,160,0.07) 0%, transparent 70%)', bottom: '-15%', left: '-10%', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={logoImg} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.3rem', color: 'var(--txt-primary)' }}>
              Clean<span style={{ color: 'var(--clr-primary)' }}>My</span>City
            </span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--txt-primary)', marginTop: 28, marginBottom: 8 }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--txt-secondary)', fontSize: '0.875rem' }}>
            Join as a <strong style={{ color: 'var(--clr-primary)' }}>Citizen</strong> to report and track city issues
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-xl)', padding: 36, backdropFilter: 'blur(24px)' }}>
          {/* Role info banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(34,211,160,0.08)', border: '1px solid rgba(34,211,160,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,211,160,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={18} style={{ color: 'var(--clr-primary)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--txt-primary)', fontSize: '0.875rem' }}>Citizen Account</div>
              <div style={{ color: 'var(--txt-secondary)', fontSize: '0.78rem', marginTop: 2 }}>Report issues, track status, and help improve your city</div>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
              <AlertCircle size={16} style={{ color: 'var(--clr-danger)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--clr-danger)' }}>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="field">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
                <input id="reg-name" type="text" required placeholder="Abebe Girma" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} style={{ paddingLeft: 44 }} />
              </div>
            </div>

            <div className="field">
              <label>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
                <input id="reg-email" type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={{ paddingLeft: 44 }} />
              </div>
            </div>

            <div className="field">
              <label>Phone <span style={{ color: 'var(--txt-muted)', fontWeight: 400 }}>(optional)</span></label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
                <input id="reg-phone" type="tel" placeholder="+251 9 00 00 00 00" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} style={{ paddingLeft: 44 }} />
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
                <input id="reg-password" type={showPw ? 'text' : 'password'} required placeholder="Min 8 chars, A-Z, 0-9, special" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} style={{ paddingLeft: 44, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="field">
              <label>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
                <input id="reg-confirm" type="password" required placeholder="••••••••" value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} style={{ paddingLeft: 44 }} />
              </div>
            </div>

            <motion.button
              id="reg-submit"
              type="submit"
              className="btn btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              style={{ width: '100%', marginTop: 4, height: 48, opacity: loading ? 0.7 : 1 }}
            >
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />Creating account…</span>
                : <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>Create Citizen Account <ArrowRight size={16} /></span>
              }
            </motion.button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--txt-secondary)', fontSize: '0.875rem', marginTop: 24 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--clr-primary)', fontWeight: 600 }}>Sign in</Link>
        </p>

        <p style={{ textAlign: 'center', color: 'var(--txt-muted)', fontSize: '0.78rem', marginTop: 12 }}>
          Organization or Admin accounts are created by the system administrator.
        </p>
      </motion.div>
    </div>
  );
}
