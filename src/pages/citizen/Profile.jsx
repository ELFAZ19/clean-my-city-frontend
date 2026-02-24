import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import Navbar from '../../components/Navbar';

function Section({ title, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-xl)', padding: 28, backdropFilter: 'blur(20px)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--txt-primary)', fontSize: '1.05rem', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--bg-glass-border)' }}>
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

function Alert({ type, message }) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 10, marginBottom: 16,
        background: isError ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
        border: `1px solid ${isError ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
        color: isError ? 'var(--clr-danger)' : '#10b981', fontSize: '0.875rem' }}>
      {isError ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
      {message}
    </motion.div>
  );
}

export default function CitizenProfile() {
  const { user, logout } = useAuth();

  // Profile info
  const [profile, setProfile]     = useState({ full_name: '', phone: '', email: '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [saving, setSaving]         = useState(false);

  // Password change
  const [pw, setPw]                = useState({ current: '', next: '', confirm: '' });
  const [showCur, setShowCur]      = useState(false);
  const [showNew, setShowNew]      = useState(false);
  const [pwMsg, setPwMsg]          = useState({ type: '', text: '' });
  const [pwSaving, setPwSaving]    = useState(false);

  useEffect(() => {
    api.get('/users/profile')
      .then(({ data }) => {
        const u = data?.data?.user || data?.user || {};
        setProfile({ full_name: u.full_name || '', phone: u.phone || '', email: u.email || '' });
      })
      .catch(() => {});
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault(); setProfileMsg({ type: '', text: '' }); setSaving(true);
    try {
      const { data } = await api.put('/users/profile', { full_name: profile.full_name, phone: profile.phone });
      const u = data?.data?.user || data?.user || {};
      setProfile(p => ({ ...p, full_name: u.full_name || p.full_name, phone: u.phone ?? p.phone }));
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault(); setPwMsg({ type: '', text: '' });
    if (pw.next !== pw.confirm) return setPwMsg({ type: 'error', text: 'New passwords do not match.' });
    setPwSaving(true);
    try {
      await api.put('/users/password', { current_password: pw.current, new_password: pw.next });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setPw({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally { setPwSaving(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '100px 24px 60px' }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, color: 'var(--txt-primary)' }}>
            My Profile
          </motion.h1>
          <p style={{ color: 'var(--txt-secondary)', marginTop: 6 }}>Manage your account information and security settings</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Avatar + role pill */}
          <Section title="Account">
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.6rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                {(profile.full_name || user?.full_name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--txt-primary)', fontSize: '1.1rem' }}>{profile.full_name || user?.full_name}</div>
                <div style={{ color: 'var(--txt-secondary)', fontSize: '0.85rem', marginTop: 3 }}>{profile.email || user?.email}</div>
                <span style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(34,211,160,0.12)', border: '1px solid rgba(34,211,160,0.25)', color: 'var(--clr-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Shield size={10} /> Citizen
                </span>
              </div>
            </div>
          </Section>

          {/* Edit profile */}
          <Section title="Personal Information">
            <Alert type={profileMsg.type} message={profileMsg.text} />
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
                  <input id="profile-name" type="text" value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} style={{ paddingLeft: 42 }} />
                </div>
              </div>
              <div className="field">
                <label>Email <span style={{ color: 'var(--txt-muted)', fontWeight: 400 }}>(read-only)</span></label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
                  <input id="profile-email" type="email" value={profile.email || user?.email || ''} disabled style={{ paddingLeft: 42, opacity: 0.55, cursor: 'default' }} />
                </div>
              </div>
              <div className="field">
                <label>Phone <span style={{ color: 'var(--txt-muted)', fontWeight: 400 }}>(optional)</span></label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
                  <input id="profile-phone" type="tel" placeholder="+251 9 00 00 00 00" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} style={{ paddingLeft: 42 }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <motion.button type="submit" className="btn btn-primary btn-sm" disabled={saving} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ opacity: saving ? 0.7 : 1 }}>
                  <Save size={14} />
                  {saving ? 'Saving…' : 'Save Changes'}
                </motion.button>
              </div>
            </form>
          </Section>

          {/* Change password */}
          <Section title="Change Password">
            <Alert type={pwMsg.type} message={pwMsg.text} />
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { id: 'pw-current', key: 'current', label: 'Current Password', show: showCur, toggle: () => setShowCur(p => !p) },
                { id: 'pw-new',     key: 'next',    label: 'New Password',     show: showNew, toggle: () => setShowNew(p => !p) },
                { id: 'pw-confirm', key: 'confirm', label: 'Confirm New Password', show: showNew, toggle: null },
              ].map(f => (
                <div key={f.key} className="field">
                  <label>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
                    <input id={f.id} type={f.show ? 'text' : 'password'} required placeholder="••••••••" value={pw[f.key]} onChange={e => setPw(p => ({ ...p, [f.key]: e.target.value }))} style={{ paddingLeft: 42, paddingRight: f.toggle ? 42 : undefined }} />
                    {f.toggle && (
                      <button type="button" onClick={f.toggle} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                        {f.show ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <motion.button type="submit" className="btn btn-primary btn-sm" disabled={pwSaving} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ opacity: pwSaving ? 0.7 : 1 }}>
                  <Lock size={14} />
                  {pwSaving ? 'Changing…' : 'Change Password'}
                </motion.button>
              </div>
            </form>
          </Section>

          {/* Danger zone */}
          <Section title="Session">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--txt-primary)', fontSize: '0.9rem' }}>Sign out</div>
                <div style={{ color: 'var(--txt-muted)', fontSize: '0.8rem', marginTop: 3 }}>This will end your current session</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={logout}
                style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'var(--clr-danger)' }}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
