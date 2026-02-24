import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, LogOut, User, LayoutDashboard, Sun, Moon, Menu, X as CloseIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/icon.png';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // AUTHORITY is the backend role name for organization accounts
  const dashboardPath =
    user?.role === 'CITIZEN'    ? '/dashboard/citizen' :
    user?.role === 'AUTHORITY'  ? '/dashboard/organization' :
    user?.role === 'ADMIN'      ? '/dashboard/admin' : '/dashboard';

  const isLanding = location.pathname === '/';

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        padding: '0 24px',
        transition: 'background 0.3s, box-shadow 0.3s, backdrop-filter 0.3s',
        background: scrolled || !isLanding
          ? 'var(--nav-bg)'
          : 'transparent',
        backdropFilter: scrolled || !isLanding ? 'blur(24px)' : 'none',
        borderBottom: scrolled || !isLanding
          ? '1px solid var(--bg-glass-border)'
          : '1px solid transparent',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <img src={logoImg} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--txt-primary)' }}>
            Clean<span style={{ color: 'var(--clr-primary)' }}>My</span>City
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'none', alignItems: 'center', gap: 32 }} className="desktop-links">
          {isLanding && (
            <>
              <a href="#features" style={{ color: 'var(--txt-secondary)', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--clr-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--txt-secondary)'}>
                Features
              </a>
              <a href="#how-it-works" style={{ color: 'var(--txt-secondary)', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--clr-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--txt-secondary)'}>
                How It Works
              </a>
              <a href="#stats" style={{ color: 'var(--txt-secondary)', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--clr-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--txt-secondary)'}>
                Impact
              </a>
              <Link to="/credentials" style={{ color: 'var(--txt-secondary)', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--clr-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--txt-secondary)'}>
                Credentials
              </Link>
            </>
          )}
        </div>

        <style>
          {`
            @media (min-width: 900px) {
              .desktop-links { display: flex !important; }
              .mobile-toggle { display: none !important; }
            }
            @media (max-width: 600px) {
              .profile-name, .profile-chevron { display: none !important; }
              .profile-btn { gap: 0 !important; padding: 8px !important; }
            }
          `}
        </style>

        {/* Auth Buttons + Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Theme toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-secondary)', cursor: 'pointer', flexShrink: 0 }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          ) : (
            <div style={{ position: 'relative' }}>
              <button
                className="profile-btn"
                onClick={() => setDropOpen(p => !p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--bg-glass-border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '8px 16px',
                  color: 'var(--txt-primary)',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--grad-brand)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                }}>
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="profile-name" style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.full_name?.split(' ')[0] || 'Profile'}
                </span>
                <ChevronDown className="profile-chevron" size={14} style={{ transition: 'transform 0.2s', transform: dropOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--bg-glass-border)',
                      borderRadius: 'var(--radius-md)',
                      minWidth: 180, overflow: 'hidden',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  >
                    <Link to={dashboardPath} onClick={() => setDropOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', color: 'var(--txt-secondary)', fontSize: '0.875rem', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.color = 'var(--txt-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--txt-secondary)'; }}>
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    {user?.role === 'CITIZEN' && (
                      <Link to="/dashboard/citizen/profile" onClick={() => setDropOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', color: 'var(--txt-secondary)', fontSize: '0.875rem', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.color = 'var(--txt-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--txt-secondary)'; }}>
                        <User size={15} /> My Profile
                      </Link>
                    )}
                    {user?.role === 'AUTHORITY' && (
                      <Link to="/dashboard/organization/profile" onClick={() => setDropOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', color: 'var(--txt-secondary)', fontSize: '0.875rem', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-glass)'; e.currentTarget.style.color = 'var(--txt-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--txt-secondary)'; }}>
                        <User size={15} /> Org Profile
                      </Link>
                    )}
                    <div style={{ height: 1, background: 'var(--bg-glass-border)' }} />
                    <button onClick={handleLogout}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', color: 'var(--clr-danger)', fontSize: '0.875rem', transition: 'all 0.15s', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(p => !p)}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--txt-primary)', cursor: 'pointer', zIndex: 1100
            }}
          >
            {mobileMenuOpen ? <CloseIcon size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: 'min(300px, 80vw)',
              background: 'var(--bg-surface)',
              backdropFilter: 'blur(34px)',
              borderLeft: '1px solid var(--bg-glass-border)',
              padding: '80px 24px 40px',
              display: 'flex', flexDirection: 'column', gap: 10,
              zIndex: 1050,
              boxShadow: '-10px 0 40px rgba(0,0,0,0.2)'
            }}
          >
            {isLanding && (
              <>
                <div style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, color: 'var(--txt-muted)', letterSpacing: '0.05em', marginBottom: 8, marginTop: 10 }}>Navigation</div>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', borderRadius: 12, color: 'var(--txt-secondary)', fontSize: '0.95rem', fontWeight: 500, background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)' }}>Features</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', borderRadius: 12, color: 'var(--txt-secondary)', fontSize: '0.95rem', fontWeight: 500, background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)' }}>How it Works</a>
                <a href="#stats" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', borderRadius: 12, color: 'var(--txt-secondary)', fontSize: '0.95rem', fontWeight: 500, background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)' }}>Impact</a>
                <Link to="/credentials" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 16px', borderRadius: 12, color: 'var(--clr-primary)', fontSize: '0.95rem', fontWeight: 600, background: 'rgba(34,211,160,0.08)', border: '1px solid rgba(34,211,160,0.2)' }}>Platform Credentials</Link>
              </>
            )}

            <div style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700, color: 'var(--txt-muted)', letterSpacing: '0.05em', marginBottom: 8, marginTop: 20 }}>Account</div>
            {!isAuthenticated ? (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-ghost" style={{ justifyContent: 'flex-start', border: '1px solid var(--bg-glass-border)' }}>Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ justifyContent: 'center' }}>Get Started</Link>
              </>
            ) : (
              <>
                <Link to={dashboardPath} onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, color: 'var(--txt-secondary)', background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)' }}>
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, color: 'var(--clr-danger)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.1)', cursor: 'pointer' }}>
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            )}
            
            <div style={{ marginTop: 'auto', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--txt-muted)' }}>© 2024 CleanMyCity</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
