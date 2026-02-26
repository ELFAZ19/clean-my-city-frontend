import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, UserCheck, UserX, RefreshCw, Search, Shield, Building2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import Navbar from '../../components/Navbar';

const ROLE_COLORS = {
  CITIZEN: { bg: 'rgba(34,211,160,0.12)', border: 'rgba(34,211,160,0.25)', color: '#22d3a0' },
  AUTHORITY: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', color: '#818cf8' },
  ADMIN: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', color: '#f59e0b' },
};

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      const raw = data?.data?.users ?? data?.users ?? data?.data ?? data;
      setUsers(Array.isArray(raw) ? raw : []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleActive = async (u) => {
    setToggling(u.id);
    try {
      await api.put(`/users/${u.id}/toggle-active`, { is_active: !u.is_active });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !u.is_active } : x));
    } catch { /* silent */ }
    finally { setToggling(null); }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(userToDelete.id);
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch { /* silent */ }
    finally { setDeleting(null); }
  };

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    citizens: users.filter(u => u.role === 'CITIZEN').length,
    authority: users.filter(u => u.role === 'AUTHORITY').length,
    active: users.filter(u => u.is_active).length,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/dashboard/admin" style={{ color: 'var(--txt-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--txt-secondary)'}>
              <ArrowLeft size={20} />
            </Link>
            <div>
              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: 800, color: 'var(--txt-primary)' }}>
                User Management
              </motion.h1>
              <p style={{ color: 'var(--txt-secondary)', marginTop: 4, fontSize: '0.85rem' }}>
                Admin: <strong style={{ color: 'var(--clr-primary)' }}>{user?.full_name}</strong>
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchUsers}><RefreshCw size={15} /></button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Users', value: stats.total, icon: Users, color: '#22d3a0' },
            { label: 'Citizens', value: stats.citizens, icon: UserCheck, color: '#10b981' },
            { label: 'Authorities', value: stats.authority, icon: Building2, color: '#818cf8' },
            { label: 'Active', value: stats.active, icon: Shield, color: '#f59e0b' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'var(--grad-card)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-lg)', padding: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--txt-primary)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--txt-secondary)', marginTop: 3 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-full)', padding: '9px 16px 9px 40px', color: 'var(--txt-primary)', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        {/* User list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--txt-muted)' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--bg-glass-border)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin-slow 0.9s linear infinite', margin: '0 auto 16px' }} />
            Loading users…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--txt-muted)' }}>
            <Users size={48} style={{ display: 'block', margin: '0 auto 16px', opacity: 0.3 }} />
            No users found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(u => {
              const rc = ROLE_COLORS[u.role] || ROLE_COLORS.CITIZEN;
              return (
                <motion.div key={u.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', background: 'var(--grad-card)', border: `1px solid ${u.is_active ? 'var(--bg-glass-border)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 'var(--radius-lg)', padding: '16px 20px', opacity: u.is_active ? 1 : 0.65 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: rc.bg, border: `1px solid ${rc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: rc.color, fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                      {(u.full_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--txt-primary)', fontSize: '0.9rem' }}>{u.full_name}</div>
                      <div style={{ color: 'var(--txt-secondary)', fontSize: '0.78rem', marginTop: 2 }}>{u.email}</div>
                      {u.phone && <div style={{ color: 'var(--txt-muted)', fontSize: '0.75rem' }}>{u.phone}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 700, background: rc.bg, border: `1px solid ${rc.border}`, color: rc.color, letterSpacing: '0.04em' }}>
                      {u.role}
                    </span>
                    <span style={{
                      padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600,
                      background: u.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${u.is_active ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                      color: u.is_active ? '#10b981' : 'var(--clr-danger)'
                    }}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {/* Don't let admin deactivate or delete themselves */}
                    {u.id !== user?.id && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={toggling === u.id}
                          style={{
                            padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, border: '1px solid', cursor: 'pointer', background: 'transparent', transition: 'all 0.2s',
                            borderColor: u.is_active ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)',
                            color: u.is_active ? 'var(--clr-danger)' : '#10b981',
                            opacity: toggling === u.id ? 0.5 : 1
                          }}>
                          {toggling === u.id ? '…' : u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => setUserToDelete(u)}
                          disabled={deleting === u.id}
                          style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', color: 'var(--clr-danger)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {userToDelete && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setUserToDelete(null)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                style={{ position: 'relative', background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 20, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: 'var(--clr-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Trash2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--txt-primary)', marginBottom: 12 }}>Delete User?</h3>
                <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.6 }}>
                  Are you sure you want to delete <strong>{userToDelete.full_name}</strong>? This will permanently remove their account.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setUserToDelete(null)} disabled={deleting}
                    className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
                  <button onClick={handleDeleteUser} disabled={deleting}
                    style={{ flex: 1, background: 'var(--clr-danger)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', opacity: deleting ? 0.7 : 1 }}>
                    {deleting ? 'Deleting…' : 'Delete User'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
