import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle, Shield, LogOut, Building2, Tag, Info } from 'lucide-react';
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

export default function OrgProfile() {
  const { user, logout } = useAuth();
  const [org, setOrg]           = useState({ id: null, name: '', description: '', category: '', contact_email: '', contact_phone: '' });
  const [profile, setProfile]   = useState({ full_name: '', phone: '' });
  const [msg, setMsg]           = useState({ type: '', text: '' });
  const [saving, setSaving]     = useState(false);

  // Password change
  const [pw, setPw]             = useState({ current: '', next: '', confirm: '' });
  const [showCur, setShowCur]    = useState(false);
  const [showNew, setShowNew]    = useState(false);
  const [pwMsg, setPwMsg]        = useState({ type: '', text: '' });
  const [pwSaving, setPwSaving]  = useState(false);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching Org Profile...');
        const { data: orgData } = await api.get('/organizations/me');
        console.log('Org Response:', orgData);
        
        if (orgData?.data?.organization) {
          setOrg(orgData.data.organization);
        } else {
          console.warn('Organization data missing from response');
        }

        console.log('Fetching User Profile...');
        const { data: userData } = await api.get('/users/profile');
        console.log('User Response:', userData);
        
        const u = userData?.data?.user || userData?.user || {};
        setProfile({ full_name: u.full_name || '', phone: u.phone || '' });
      } catch (err) {
        console.error('Failed to load profile data:', err);
        setError('Could not load your profile data. Please ensure you are logged in correctly.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOrgSave = async (e) => {
    e.preventDefault(); setMsg({ type: '', text: '' }); setSaving(true);
    try {
      // Update User Profile
      await api.put('/users/profile', { full_name: profile.full_name, phone: profile.phone });
      // Update Organization Data
      const { data } = await api.put(`/organizations/${org.id}`, {
        description: org.description,
        category: org.category,
        contact_email: org.contact_email,
        contact_phone: org.contact_phone
      });
      setOrg(data.data.organization);
      setMsg({ type: 'success', text: 'Organization profile updated successfully.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update organization profile.' });
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
      <div style={{ maxWidth: 750, margin: '0 auto', padding: '100px 24px 60px' }}>
        <div style={{ marginBottom: 36 }}>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, color: 'var(--txt-primary)' }}>
            Organization Profile
          </motion.h1>
          <p style={{ color: 'var(--txt-secondary)', marginTop: 6 }}>Manage your organization's public identity and account security</p>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--bg-glass-border)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem' }}>Loading your profile data...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <Section title="Load Error">
            <Alert type="error" message={error} />
            <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>Retry Loading</button>
          </Section>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Identity */}
          <Section title="Organization Identity">
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.6rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                {(org.name || user?.full_name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--txt-primary)', fontSize: '1.1rem' }}>{org.name || user?.full_name}</div>
                <div style={{ color: 'var(--txt-secondary)', fontSize: '0.85rem', marginTop: 3 }}>{user?.email}</div>
                <span style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Shield size={10} /> Authority Account
                </span>
              </div>
            </div>
          </Section>

          {/* Org Details Form */}
          <Section title="Public Profile & Contact Info">
            <Alert type={msg.type} message={msg.text} />
            <form onSubmit={handleOrgSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div className="field">
                  <label>Representative Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)' }} />
                    <input type="text" value={profile.full_name || ''} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} style={{ paddingLeft: 42 }} />
                  </div>
                </div>
                <div className="field">
                  <label>Category</label>
                  <div style={{ position: 'relative' }}>
                    <Tag size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)' }} />
                    <input type="text" value={org.category || ''} onChange={e => setOrg(p => ({ ...p, category: e.target.value }))} style={{ paddingLeft: 42 }} />
                  </div>
                </div>
              </div>

              <div className="field">
                <label>Organization Description</label>
                <div style={{ position: 'relative' }}>
                  <Info size={14} style={{ position: 'absolute', left: 14, top: 16, color: 'var(--txt-muted)' }} />
                  <textarea rows={3} value={org.description || ''} onChange={e => setOrg(p => ({ ...p, description: e.target.value }))} style={{ paddingLeft: 42, minHeight: 100, borderRadius: 12 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div className="field">
                  <label>Contact Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)' }} />
                    <input type="email" value={org.contact_email || ''} onChange={e => setOrg(p => ({ ...p, contact_email: e.target.value }))} style={{ paddingLeft: 42 }} />
                  </div>
                </div>
                <div className="field">
                  <label>Contact Phone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)' }} />
                    <input type="tel" value={org.contact_phone || ''} onChange={e => setOrg(p => ({ ...p, contact_phone: e.target.value }))} style={{ paddingLeft: 42 }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <motion.button type="submit" className="btn btn-primary btn-sm" disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Save size={14} /> {saving ? 'Saving…' : 'Update Profile'}
                </motion.button>
              </div>
            </form>
          </Section>

          {/* Password */}
          <Section title="Security">
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
                    <Lock size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)' }} />
                    <input type={f.show ? 'text' : 'password'} required placeholder="••••••••" value={pw[f.key]} onChange={e => setPw(p => ({ ...p, [f.key]: e.target.value }))} style={{ paddingLeft: 42, paddingRight: f.toggle ? 42 : undefined }} />
                    {f.toggle && (
                      <button type="button" onClick={f.toggle} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        {f.show ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <motion.button type="submit" className="btn btn-primary btn-sm" disabled={pwSaving}>
                  <Lock size={14} /> {pwSaving ? 'Updating…' : 'Change Password'}
                </motion.button>
              </div>
            </form>
          </Section>

          <Section title="Session">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--txt-primary)', fontSize: '0.9rem' }}>Sign out</div>
                <div style={{ color: 'var(--txt-muted)', fontSize: '0.8rem', marginTop: 3 }}>End your authority session</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={logout} style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'var(--clr-danger)' }}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </Section>
        </div>
        )}
      </div>
    </div>
  );
}
