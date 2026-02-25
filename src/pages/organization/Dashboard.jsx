import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, Clock, AlertTriangle, Building2, Download, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import Navbar from '../../components/Navbar';
import IssueCard from '../../components/IssueCard';

export default function OrgDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [orgId, setOrgId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/issues/queue');
      const raw = data?.data?.issues ?? data?.data ?? data?.issues ?? data;
      setIssues(Array.isArray(raw) ? raw : []);
      if (data?.data?.organization_id) setOrgId(data.data.organization_id);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQueue(); }, []);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handler = e => { if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExport = async (format) => {
    if (!orgId) return;
    setExporting(true); setExportOpen(false);
    try {
      const { data, headers } = await api.get(`/organizations/${orgId}/export?format=${format}`, { responseType: 'blob' });
      const cd = headers['content-disposition'] || '';
      const fnMatch = cd.match(/filename="?([^"]+)"?/);
      const filename = fnMatch ? fnMatch[1] : `report.${format}`;
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    } catch { /* silent */ }
    finally { setExporting(false); }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/issues/${id}/status`, { status });
      setIssues(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    } catch { /* silent */ }
    finally { setUpdating(null); }
  };

  const FILTER_OPTIONS = ['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'];
  const filtered = filter === 'ALL'
    ? issues
    : issues.filter(i => i.status?.toUpperCase() === filter);

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status?.toUpperCase() === 'PENDING').length,
    inProgress: issues.filter(i => i.status?.toUpperCase() === 'IN_PROGRESS').length,
    resolved: issues.filter(i => i.status?.toUpperCase() === 'RESOLVED').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(80px,10vw,100px) 16px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 36, flexWrap: 'wrap' }}>
          <div>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, color: 'var(--txt-primary)' }}>
              Issue Queue
            </motion.h1>
            <p style={{ color: 'var(--txt-secondary)', marginTop: 6 }}>
              <Building2 size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--clr-primary)' }} />
              {user?.full_name}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={fetchQueue}><RefreshCw size={15} /></button>
            {/* Export dropdown */}
            <div ref={exportRef} style={{ position: 'relative' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setExportOpen(v => !v)} disabled={exporting || !orgId}
                style={{ gap: 6, borderColor: 'rgba(34,211,160,0.3)', color: 'var(--clr-primary)' }}>
                <Download size={14} /> {exporting ? 'Exporting…' : 'Export'} <ChevronDown size={12} />
              </button>
              {exportOpen && (
                <div style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 12, minWidth: 160, zIndex: 200, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                  {[['csv', 'CSV (.csv)'], ['xlsx', 'Excel (.xlsx)']].map(([fmt, label]) => (
                    <button key={fmt} onClick={() => handleExport(fmt)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', color: 'var(--txt-primary)', cursor: 'pointer', fontSize: '0.85rem', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total', value: stats.total, color: '#22d3a0', icon: Building2 },
            { label: 'Pending', value: stats.pending, color: '#f59e0b', icon: Clock },
            { label: 'In Progress', value: stats.inProgress, color: '#6366f1', icon: AlertTriangle },
            { label: 'Resolved', value: stats.resolved, color: '#10b981', icon: CheckCircle },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'var(--grad-card)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--txt-primary)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--txt-secondary)', marginTop: 4 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {FILTER_OPTIONS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 18px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600,
              border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
              background: filter === f ? 'var(--clr-primary)' : 'var(--bg-glass)',
              borderColor: filter === f ? 'var(--clr-primary)' : 'var(--bg-glass-border)',
              color: filter === f ? '#fff' : 'var(--txt-secondary)',
            }}>
              {f === 'IN_PROGRESS' ? 'In Progress' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Issue Queue */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--txt-muted)' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--bg-glass-border)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin-slow 0.9s linear infinite', margin: '0 auto 16px' }} />
            Loading queue…
          </div>
        ) : filtered.length === 0 ? (
          <div key={`empty-${filter}`} style={{ textAlign: 'center', padding: 80, color: 'var(--txt-muted)' }}>
            <CheckCircle size={48} style={{ display: 'block', margin: '0 auto 16px', opacity: 0.3 }} />
            No {filter === 'ALL' ? '' : filter.replace('_', ' ').toLowerCase() + ' '}issues in this queue.
          </div>
        ) : (
          <div key={filter} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(issue => (
              <motion.div key={issue.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <IssueCard issue={issue} actions={
                  <>
                    {issue.status?.toUpperCase() === 'PENDING' && (
                      <button onClick={() => updateStatus(issue.id, 'IN_PROGRESS')}
                        disabled={updating === issue.id}
                        className="btn btn-ghost btn-sm"
                        style={{ borderColor: 'rgba(99,102,241,0.4)', color: '#818cf8' }}>
                        {updating === issue.id ? '…' : 'Start'}
                      </button>
                    )}
                    {issue.status?.toUpperCase() === 'IN_PROGRESS' && (
                      <button onClick={() => updateStatus(issue.id, 'RESOLVED')}
                        disabled={updating === issue.id}
                        className="btn btn-ghost btn-sm"
                        style={{ borderColor: 'rgba(16,185,129,0.4)', color: '#10b981' }}>
                        {updating === issue.id ? '…' : '✓ Mark Resolved'}
                      </button>
                    )}
                    {issue.status?.toUpperCase() === 'RESOLVED' && (
                      <span style={{ fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={12} /> Resolved
                      </span>
                    )}
                  </>
                } />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
