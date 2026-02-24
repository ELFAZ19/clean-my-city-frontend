import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, MapPin, RefreshCw, LogOut, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import Navbar from '../../components/Navbar';
import IssueCard from '../../components/IssueCard';

const FILTER_OPTIONS = ['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'];

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues]   = useState([]);
  const [filter, setFilter]   = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchIssues = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/issues/my-issues');
      const raw = data?.data?.issues ?? data?.data ?? data?.issues ?? data;
      setIssues(Array.isArray(raw) ? raw : []);
    } catch {
      setError('Failed to load your issues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssues(); }, []);

  const filtered = filter === 'ALL' ? issues : issues.filter(i => i.status === filter);

  const stats = {
    total:      issues.length,
    pending:    issues.filter(i => i.status === 'PENDING').length,
    inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
    resolved:   issues.filter(i => i.status === 'RESOLVED').length,
  };

  const STAT_CARDS = [
    { label: 'Total',       value: stats.total,      icon: MapPin,         color: '#22d3a0' },
    { label: 'Pending',     value: stats.pending,    icon: Clock,          color: '#f59e0b' },
    { label: 'In Progress', value: stats.inProgress, icon: AlertTriangle,  color: '#6366f1' },
    { label: 'Resolved',    value: stats.resolved,   icon: CheckCircle,    color: '#10b981' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 60px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, color: 'var(--txt-primary)' }}
            >
              My Issues
            </motion.h1>
            <p style={{ color: 'var(--txt-secondary)', marginTop: 6 }}>
              Welcome back, <strong style={{ color: 'var(--clr-primary)' }}>{user?.full_name?.split(' ')[0]}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost btn-sm" onClick={fetchIssues} title="Refresh">
              <RefreshCw size={15} />
            </button>
            <Link to="/dashboard/citizen/create" className="btn btn-primary btn-sm">
              <Plus size={15} /> Report Issue
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <motion.div
          initial="hidden" animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}
        >
          {STAT_CARDS.map((s) => (
            <motion.div key={s.label} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              style={{ background: 'var(--grad-card)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--txt-primary)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--txt-secondary)', marginTop: 4 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {FILTER_OPTIONS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '7px 18px', borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem', fontWeight: 600, border: '1px solid',
                cursor: 'pointer', transition: 'all 0.2s',
                background: filter === f ? 'var(--clr-primary)' : 'var(--bg-glass)',
                borderColor: filter === f ? 'var(--clr-primary)' : 'var(--bg-glass-border)',
                color: filter === f ? '#fff' : 'var(--txt-secondary)',
              }}
            >
              {f === 'IN_PROGRESS' ? 'In Progress' : f.charAt(0) + f.slice(1).toLowerCase()}
              {f !== 'ALL' && (
                <span style={{ marginLeft: 6, opacity: 0.7 }}>
                  {issues.filter(i => i.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Issue list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--txt-muted)' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--bg-glass-border)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin-slow 0.9s linear infinite', margin: '0 auto 16px' }} />
            Loading your issues…
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--clr-danger)' }}>{error}</div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 24px' }}>
            <MapPin size={48} style={{ color: 'var(--txt-muted)', margin: '0 auto 16px', display: 'block' }} />
            <p style={{ color: 'var(--txt-secondary)', fontSize: '1.05rem', marginBottom: 20 }}>
              {filter === 'ALL' ? "You haven't reported any issues yet." : `No ${filter.toLowerCase()} issues.`}
            </p>
            {filter === 'ALL' && (
              <Link to="/dashboard/citizen/create" className="btn btn-primary">
                <Plus size={16} /> Report Your First Issue
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial="hidden" animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {filtered.map((issue) => (
              <motion.div key={issue.id} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                <IssueCard issue={issue} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
