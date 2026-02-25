import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, RefreshCw, X, CheckCircle, XCircle, AlertCircle, Users, Trash2, LayoutGrid, FileText, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import Navbar from '../../components/Navbar';
import IssueCard from '../../components/IssueCard';

function ConfirmDeleteModal({ org, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.95 }}
        style={{ position: 'relative', width: '100%', maxWidth: 420, background: 'var(--bg-surface)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-xl)', padding: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Trash2 size={22} style={{ color: 'var(--clr-danger)' }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--txt-primary)', textAlign: 'center', marginBottom: 8 }}>Delete Organization?</h2>
        <p style={{ color: 'var(--txt-secondary)', textAlign: 'center', fontSize: '0.9rem', marginBottom: 24 }}>
          This will permanently delete <strong style={{ color: 'var(--txt-primary)' }}>{org.name}</strong> and its user account. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '10px 20px', borderRadius: 'var(--radius-full)', background: 'var(--clr-danger)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function OrgModal({ org, onClose, onSave }) {
  const [form, setForm] = useState(org ? { ...org } : { name: '', email: '', phone: '', category: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (org) { await api.put(`/organizations/${org.id}`, form); }
      else { await api.post('/organizations', form); }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save organization.');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
      <motion.div initial={{ opacity: 0, y: 32, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 32, scale: 0.95 }}
        style={{ position: 'relative', width: '100%', maxWidth: 440, background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-xl)', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--txt-primary)' }}>
            {org ? 'Edit Organization' : 'New Organization'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--txt-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', color: 'var(--clr-danger)', fontSize: '0.85rem', marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { id: 'org-name', key: 'name', label: 'Organization Name', type: 'text' },
            { id: 'org-email', key: 'email', label: 'Email', type: 'email' },
            { id: 'org-phone', key: 'phone', label: 'Phone', type: 'tel' },
            { id: 'org-category', key: 'category', label: 'Category', type: 'text' },
          ].map(f => (
            <div key={f.key} className="field">
              <label>{f.label}</label>
              <input id={f.id} type={f.type} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} required={f.key !== 'phone'} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orgs'); // 'orgs' | 'reports'
  const [orgs, setOrgs] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOrgs = async () => {
    setLoading(true);
    try { const { data } = await api.get('/organizations'); const raw = data?.data?.organizations ?? data?.organizations ?? data?.data ?? data; setOrgs(Array.isArray(raw) ? raw : []); }
    catch { /* silent */ }
    finally { setLoading(false); }
  };

  const fetchIssues = async () => {
    setLoading(true);
    try { const { data } = await api.get('/issues/all'); setAllIssues(data?.data?.issues || []); }
    catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'orgs') fetchOrgs();
    else fetchIssues();
  }, [activeTab]);

  const toggleActive = async (org) => {
    const endpoint = org.is_active ? `/organizations/${org.id}/deactivate` : `/organizations/${org.id}/activate`;
    try {
      await api.put(endpoint);
      setOrgs(prev => prev.map(o => o.id === org.id ? { ...o, is_active: !o.is_active } : o));
    } catch { /* silent */ }
  };

  const handleSaved = () => { setModal(null); fetchOrgs(); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/organizations/${deleteTarget.id}`);
      setOrgs(prev => prev.filter(o => o.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch { /* silent */ }
    finally { setDeleting(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(80px,10vw,100px) 16px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
          <div>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, color: 'var(--txt-primary)' }}>
              {activeTab === 'orgs' ? 'Organization Management' : 'Global Issue Reports'}
            </motion.h1>
            <p style={{ color: 'var(--txt-secondary)', marginTop: 6 }}>
              Admin Control Panel | <strong style={{ color: 'var(--clr-primary)' }}>{user?.full_name}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/dashboard/admin/users" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}><Users size={15} /> Users</Link>
            <Link to="/analytics" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none', borderColor: 'rgba(34,211,160,0.3)', color: 'var(--clr-primary)' }}><BarChart2 size={15} /> Analytics</Link>
            <button className="btn btn-ghost btn-sm" onClick={() => activeTab === 'orgs' ? fetchOrgs() : fetchIssues()}><RefreshCw size={15} /></button>
            {activeTab === 'orgs' && (
              <button className="btn btn-primary btn-sm" onClick={() => setModal('new')}>
                <Plus size={15} /> New Org
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-glass)', padding: 4, borderRadius: 12, marginBottom: 32, maxWidth: 360, border: '1px solid var(--bg-glass-border)' }}>
          <button onClick={() => setActiveTab('orgs')} style={{
            flex: 1, padding: '10px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.85rem',
            background: activeTab === 'orgs' ? 'var(--bg-base)' : 'transparent',
            color: activeTab === 'orgs' ? 'var(--clr-primary)' : 'var(--txt-secondary)',
            boxShadow: activeTab === 'orgs' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
          }}>
            Organizations
          </button>
          <button onClick={() => setActiveTab('reports')} style={{
            flex: 1, padding: '10px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.85rem',
            background: activeTab === 'reports' ? 'var(--bg-base)' : 'transparent',
            color: activeTab === 'reports' ? 'var(--clr-primary)' : 'var(--txt-secondary)',
            boxShadow: activeTab === 'reports' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
          }}>
            Global Reports
          </button>
        </div>

        {/* Dynamic Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--txt-muted)' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--bg-glass-border)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin-slow 0.9s linear infinite', margin: '0 auto 16px' }} />
            Loading {activeTab === 'orgs' ? 'organizations' : 'reports'}…
          </div>
        ) : activeTab === 'orgs' ? (
          <>
            {/* Summary badges for orgs */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
              {[
                { label: `${orgs.length} Total`, color: '#22d3a0' },
                { label: `${orgs.filter(o => o.is_active).length} Active`, color: '#10b981' },
                { label: `${orgs.filter(o => !o.is_active).length} Inactive`, color: '#f59e0b' },
              ].map(b => (
                <span key={b.label} style={{ padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, background: `${b.color}15`, border: `1px solid ${b.color}30`, color: b.color }}>
                  {b.label}
                </span>
              ))}
            </div>

            {orgs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80, color: 'var(--txt-muted)' }}>
                <Building2 size={48} style={{ display: 'block', margin: '0 auto 16px', opacity: 0.3 }} />No organizations yet.
              </div>
            ) : (
              <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                {orgs.map(org => (
                  <motion.div key={org.id} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    style={{ background: 'var(--grad-card)', border: `1px solid ${org.is_active ? 'rgba(34,211,160,0.2)' : 'var(--bg-glass-border)'}`, borderRadius: 'var(--radius-lg)', padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: org.is_active ? 'rgba(34,211,160,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={20} style={{ color: org.is_active ? 'var(--clr-primary)' : 'var(--txt-muted)' }} />
                        </div>
                        <div>
                          <h3 style={{ fontWeight: 700, color: 'var(--txt-primary)', fontSize: '0.95rem' }}>{org.name}</h3>
                          {org.category && <p style={{ color: 'var(--txt-muted)', fontSize: '0.75rem', marginTop: 2 }}>{org.category}</p>}
                        </div>
                      </div>
                      <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600, background: org.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)', color: org.is_active ? '#10b981' : 'var(--clr-danger)', border: `1px solid ${org.is_active ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}` }}>
                        {org.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {org.email && <p style={{ color: 'var(--txt-secondary)', fontSize: '0.82rem', marginBottom: 4 }}>{org.email}</p>}
                    {org.phone && <p style={{ color: 'var(--txt-secondary)', fontSize: '0.82rem' }}>{org.phone}</p>}

                    <div style={{ display: 'flex', gap: 8, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--bg-glass-border)', flexWrap: 'wrap' }}>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setModal(org)}>Edit</button>
                      <button onClick={() => toggleActive(org)} style={{ flex: 1, padding: '7px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, border: '1px solid', cursor: 'pointer', background: 'transparent', transition: 'all 0.2s', borderColor: org.is_active ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)', color: org.is_active ? 'var(--clr-danger)' : '#10b981' }}>{org.is_active ? 'Deactivate' : 'Activate'}</button>
                      <button onClick={() => setDeleteTarget(org)} title="Delete organization"
                        style={{ width: 34, height: 34, borderRadius: 'var(--radius-full)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--clr-danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        ) : (
          /* Global Reports Tab */
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
            {allIssues.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 80, color: 'var(--txt-muted)' }}>
                <FileText size={48} style={{ display: 'block', margin: '0 auto 16px', opacity: 0.3 }} />
                No issue reports found on the platform.
              </div>
            ) : (
              allIssues.map(issue => (
                <motion.div key={issue.id} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                  <IssueCard issue={issue} />
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {modal && <OrgModal org={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSaved} />}
        {deleteTarget && <ConfirmDeleteModal org={deleteTarget} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}
      </AnimatePresence>
    </div>
  );
}
