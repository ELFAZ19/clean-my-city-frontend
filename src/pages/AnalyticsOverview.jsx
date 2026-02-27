import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, ScatterChart, Scatter
} from 'recharts';
import {
  Download, RefreshCw, ChevronDown, BarChart2, TrendingUp,
  CheckCircle, Clock, AlertTriangle, Activity, Shield, Building2,
  FileSpreadsheet, Layers
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Navbar from '../components/Navbar';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

/* ── Brand palette ─────────────────────────────────────────── */
const COLORS = ['#22d3a0', '#6366f1', '#f59e0b', '#0ea5e9'];

/* ── Custom tooltip ─────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0d1629',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '10px 14px',
      fontSize: '0.8rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    }}>
      {label && <div style={{ color: 'var(--txt-muted)', marginBottom: 6, fontSize: '0.72rem' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--txt-primary)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: 'var(--txt-secondary)' }}>{p.name}:</span>
          <strong style={{ color: 'var(--txt-primary)' }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

/* ── Stat card (from org dashboard) ────────────────────────── */
function StatCard({ label, value, color, Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      style={{
        background: 'var(--grad-card)',
        border: '1px solid var(--bg-glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.18 } }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        border: `1px solid ${color}28`
      }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--txt-primary)', lineHeight: 1 }}>
          {value ?? '—'}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--txt-secondary)', marginTop: 4 }}>{label}</div>
      </div>
    </motion.div>
  );
}

/* ── Enhanced chart card ────────────────────────────────────── */
function ChartCard({ title, subtitle, icon: Icon, iconColor, children, wide, accentColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`analytics-card${wide ? ' analytics-card--wide' : ''}`}
      style={{
        borderColor: `${accentColor || 'rgba(34,211,160,0'}0.18)`,
        transition: 'border-color 0.25s, box-shadow 0.25s',
      }}
      whileHover={{
        borderColor: `${accentColor || '#22d3a0'}40`,
        boxShadow: `0 0 28px ${accentColor || '#22d3a0'}18`,
        transition: { duration: 0.2 }
      }}
    >
      <div className="analytics-card-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            {Icon && (
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: `${accentColor || '#22d3a0'}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={14} style={{ color: accentColor || '#22d3a0' }} />
              </div>
            )}
            <h2>{title}</h2>
          </div>
          <span>{subtitle}</span>
        </div>
      </div>
      <div className="analytics-chart">{children}</div>
    </motion.div>
  );
}

/* ── Loading skeleton ─────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--txt-muted)' }}>
      <div style={{
        width: 44, height: 44,
        border: '3px solid var(--bg-glass-border)',
        borderTopColor: 'var(--clr-primary)',
        borderRadius: '50%',
        animation: 'spin-slow 0.9s linear infinite',
        margin: '0 auto 16px'
      }} />
      <p style={{ fontSize: '0.85rem' }}>Loading analytics data…</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function AnalyticsOverview() {
  const { role, user } = useAuth();
  const isAdmin = role === 'ADMIN';

  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [series, setSeries] = useState({
    timeseries: [], resolutionByCategory: [], slaBuckets: [], backlogScatter: []
  });
  const [activeChart, setActiveChart] = useState('overview'); // 'overview' | 'resolution'
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef(null);

  /* Derived KPI stats from timeseries */
  const totalReported = series.timeseries.reduce((a, d) => a + (d.total || 0), 0);
  const totalResolved = series.timeseries.reduce((a, d) => a + (d.resolved || 0), 0);
  const totalPending = totalReported - totalResolved > 0 ? totalReported - totalResolved : 0;

  // Sum up all buckets that are less than 24h
  const slaCompliant = series.slaBuckets
    .filter(b => b.name && !b.name.includes('>') && b.name.includes('h'))
    .reduce((a, b) => a + (b.value || 0), 0);

  /* Fetch analytics */
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true); setError('');
      try {
        const days = parseInt(range, 10);
        const endpoint = isAdmin ? '/issues/analytics/global' : '/issues/analytics/organization';
        const { data } = await api.get(endpoint, { params: { range: days } });

        const payload = data?.data || {};
        console.log('Analytics payload received:', payload);

        setSeries({
          timeseries: Array.isArray(payload.timeseries) ? payload.timeseries : [],
          resolutionByCategory: Array.isArray(payload.resolutionByCategory) ? payload.resolutionByCategory : [],
          slaBuckets: Array.isArray(payload.slaBuckets) ? payload.slaBuckets : [],
          backlogScatter: Array.isArray(payload.backlogScatter) ? payload.backlogScatter : [],
        });
      } catch (err) {
        console.error('Analytics fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [range, isAdmin]);

  /* Close export dropdown on outside click */
  useEffect(() => {
    const handler = e => {
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Excel export ─────────────────────────────────────────── */
  const handleExport = (format) => {
    setExporting(true); setExportOpen(false);
    try {
      if (format === 'xlsx') {
        const wb = XLSX.utils.book_new();

        /* Sheet 1 – Timeseries */
        if (series.timeseries.length) {
          const ws1 = XLSX.utils.json_to_sheet(series.timeseries);
          XLSX.utils.book_append_sheet(wb, ws1, 'Timeseries');
        }

        /* Sheet 2 – Resolution by Category */
        if (series.resolutionByCategory.length) {
          const ws2 = XLSX.utils.json_to_sheet(series.resolutionByCategory);
          XLSX.utils.book_append_sheet(wb, ws2, 'ResolutionByCategory');
        }

        /* Sheet 3 – SLA Buckets */
        if (series.slaBuckets.length) {
          const ws3 = XLSX.utils.json_to_sheet(series.slaBuckets);
          XLSX.utils.book_append_sheet(wb, ws3, 'SLABuckets');
        }

        /* Sheet 4 – Backlog Scatter */
        if (series.backlogScatter.length) {
          const ws4 = XLSX.utils.json_to_sheet(series.backlogScatter);
          XLSX.utils.book_append_sheet(wb, ws4, 'BacklogScatter');
        }

        /* Fallback empty sheet so the file is always valid */
        if (wb.SheetNames.length === 0) {
          const ws = XLSX.utils.aoa_to_sheet([['No data available for the selected range']]);
          XLSX.utils.book_append_sheet(wb, ws, 'Analytics');
        }

        const label = isAdmin ? 'Global' : 'Organization';
        XLSX.writeFile(wb, `CleanMyCity_${label}_Analytics_${range}.xlsx`);
      } else if (format === 'csv') {
        /* CSV: export timeseries only */
        const ws = XLSX.utils.json_to_sheet(series.timeseries.length ? series.timeseries : [{ note: 'No data' }]);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `CleanMyCity_Analytics_${range}.csv`; a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setExporting(false);
    }
  };

  /* ── Chart tab labels ─────────────────────────────────────── */
  // Resolution, SLA, and Backlog are Admin only
  const TABS = [
    { id: 'overview', label: 'Issue Trends', icon: TrendingUp },
  ];

  /* ── Shared chart styles ─────────────────────────────────── */
  const tooltipStyle = {
    contentStyle: { background: '#0d1629', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8rem' },
    cursor: { stroke: 'rgba(34,211,160,0.3)' }
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ paddingTop: 90 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(20px,4vw,48px) 16px 80px' }}>

          {/* ── Header ─────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--clr-primary)', fontWeight: 700, marginBottom: 10,
                background: 'rgba(34,211,160,0.08)', border: '1px solid rgba(34,211,160,0.2)',
                borderRadius: 'var(--radius-full)', padding: '5px 14px'
              }}>
                <Activity size={11} />
                {isAdmin ? 'Platform-wide analytics' : 'Authority analytics'}
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                  fontWeight: 800,
                  color: 'var(--txt-primary)',
                  marginBottom: 8,
                  lineHeight: 1.15
                }}
              >
                {isAdmin ? 'Admin & Authority' : 'Authority'}{' '}
                <span style={{ background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Control Center
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem', maxWidth: 520 }}
              >
                {isAdmin
                  ? `Live platform performance: reporting behaviour, SLA compliance, and backlog health across every organization.`
                  : `Your organization's performance: issue trends, resolution rates, and SLA compliance.`}
                {user?.full_name && (
                  <> — <strong style={{ color: 'var(--clr-primary)' }}>{user.full_name}</strong></>
                )}
              </motion.p>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Range picker */}
              <select
                value={range}
                onChange={e => setRange(e.target.value)}
                className="field-select"
                style={{ minWidth: 140 }}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>

              {/* Refresh */}
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setRange(r => r)}
                disabled={loading}
                title="Refresh"
              >
                <RefreshCw size={14} style={{ animation: loading ? 'spin-slow 1s linear infinite' : 'none' }} />
              </button>

              {/* Export dropdown */}
              <div ref={exportRef} style={{ position: 'relative' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setExportOpen(v => !v)}
                  disabled={exporting}
                  style={{ gap: 6 }}
                >
                  <FileSpreadsheet size={14} />
                  {exporting ? 'Exporting…' : 'Export analytics'}
                  <ChevronDown size={12} style={{ transform: exportOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                <AnimatePresence>
                  {exportOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--bg-glass-border)',
                        borderRadius: 12, minWidth: 180, zIndex: 500,
                        overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.5)'
                      }}
                    >
                      <div style={{ padding: '8px 12px', fontSize: '0.7rem', color: 'var(--txt-muted)', borderBottom: '1px solid var(--bg-glass-border)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Download as
                      </div>
                      {[
                        { fmt: 'xlsx', label: 'Excel (.xlsx)', icon: '' },
                        { fmt: 'csv', label: 'CSV (.csv)', icon: '' },
                      ].map(({ fmt, label, icon }) => (
                        <button
                          key={fmt}
                          onClick={() => handleExport(fmt)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            width: '100%', textAlign: 'left',
                            padding: '11px 16px', background: 'none', border: 'none',
                            color: 'var(--txt-primary)', cursor: 'pointer',
                            fontSize: '0.85rem', transition: 'background 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <span>{icon}</span> {label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Error banner ─────────────────────────────────────── */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 12, padding: '12px 16px', color: 'var(--clr-danger)',
                fontSize: '0.85rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              <AlertTriangle size={14} /> {error}
            </motion.div>
          )}

          {/* ── KPI stat cards (org dashboard pattern) ──────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 16,
            marginBottom: 32
          }}>
            <StatCard label="Issues Reported" value={totalReported} color="#22d3a0" Icon={Activity} delay={0} />
            <StatCard label="Resolved" value={totalResolved} color="#10b981" Icon={CheckCircle} delay={0.06} />
            <StatCard label="Pending / Open" value={totalPending} color="#f59e0b" Icon={Clock} delay={0.12} />
            <StatCard label="SLA: < 24h Resolved" value={slaCompliant} color="#6366f1" Icon={Shield} delay={0.18} />
          </div>

          {/* ── Summary badges (admin orgs pattern) ──────────────── */}


          {/* ── Chart tab switcher (admin dashboard pattern) ──────── */}
          <div style={{
            display: 'flex', background: 'var(--bg-glass)', padding: 4,
            borderRadius: 14, marginBottom: 28, overflowX: 'auto',
            border: '1px solid var(--bg-glass-border)', maxWidth: '100%', gap: 2
          }}>
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeChart === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveChart(id)}
                  style={{
                    flex: 1, padding: '9px 16px', borderRadius: 10,
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    background: active ? 'var(--bg-base)' : 'transparent',
                    color: active ? 'var(--clr-primary)' : 'var(--txt-secondary)',
                    boxShadow: active ? '0 4px 12px rgba(0,0,0,0.18)' : 'none',
                  }}
                >
                  <Icon size={13} /> {label}
                </button>
              );
            })}
          </div>

          {/* ── Charts ────────────────────────────────────────────── */}
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div style={{
              textAlign: 'center', padding: '60px 0',
              background: 'var(--bg-glass)', borderRadius: 16,
              border: '1px solid var(--bg-glass-border)'
            }}>
              <AlertTriangle size={32} style={{ color: 'var(--clr-danger)', marginBottom: 12, opacity: 0.6 }} />
              <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem' }}>
                We couldn't load the analytics data at this time.
              </p>
              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: 16 }}
                onClick={() => setRange(r => r)}
              >
                Try again
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeChart}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {/* Overview tab: wide timeseries line chart */}
                {activeChart === 'overview' && (
                  <div className="analytics-grid">
                    <ChartCard
                      title="Issue intake over time"
                      subtitle="Total reported vs. resolved per day"
                      icon={TrendingUp}
                      accentColor="#22d3a0"
                      wide
                    >
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={series.timeseries} margin={{ top: 10, left: -10, right: 16 }}>
                          <defs>
                            <linearGradient id="lineGradTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#22d3a0" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#22d3a0" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                          <XAxis dataKey="day" stroke="var(--txt-muted)" tick={{ fontSize: 11 }} />
                          <YAxis stroke="var(--txt-muted)" tick={{ fontSize: 11 }} />
                          <Tooltip {...tooltipStyle} content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} />
                          <Line type="monotone" dataKey="total" name="Total" stroke="#22d3a0" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                          <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                      title="SLA compliance"
                      subtitle="Time-to-first-action buckets"
                      icon={Shield}
                      accentColor="#6366f1"
                    >
                      <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                          <Pie
                            data={series.slaBuckets}
                            dataKey="value" nameKey="name"
                            innerRadius="50%" outerRadius="78%"
                            paddingAngle={3}
                          >
                            {series.slaBuckets.map((entry, index) => (
                              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip {...tooltipStyle} content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard
                      title="Backlog health"
                      subtitle="Age (days) vs. priority weight"
                      icon={Layers}
                      accentColor="#f59e0b"
                    >
                      <ResponsiveContainer width="100%" height={320}>
                        <ScatterChart margin={{ top: 10, left: -20, right: 0 }}>
                          <CartesianGrid stroke="rgba(148,163,184,0.12)" />
                          <XAxis type="number" dataKey="x" name="Age (days)" stroke="var(--txt-muted)" tick={{ fontSize: 11 }} />
                          <YAxis type="number" dataKey="y" name="Priority weight" stroke="var(--txt-muted)" tick={{ fontSize: 11 }} />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} {...tooltipStyle} content={<CustomTooltip />} />
                          <Scatter data={series.backlogScatter} fill="#f59e0b" opacity={0.8} />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </div>
                )}

                {/* Resolution tab: bar chart */}
                {activeChart === 'resolution' && (
                  <ChartCard
                    title="Resolved by category"
                    subtitle="Issues resolved across all authorities / categories"
                    icon={BarChart2}
                    accentColor="#22d3a0"
                    wide
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={series.resolutionByCategory} margin={{ top: 10, left: -20, right: 0 }}>
                        <defs>
                          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22d3a0" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                        <XAxis dataKey="category" stroke="var(--txt-muted)" tick={{ fontSize: 11 }} />
                        <YAxis stroke="var(--txt-muted)" tick={{ fontSize: 11 }} />
                        <Tooltip {...tooltipStyle} content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
                        <Bar dataKey="resolved" name="Resolved" radius={[8, 8, 0, 0]} fill="url(#barGrad)" />
                        <Bar dataKey="total" name="Total" radius={[8, 8, 0, 0]} fill="rgba(255,255,255,0.07)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}

                {/* SLA tab: full-width pie */}
                {activeChart === 'sla' && (
                  <ChartCard
                    title="SLA Compliance Breakdown"
                    subtitle="Distribution of time-to-first-action across all issues"
                    icon={Shield}
                    accentColor="#6366f1"
                    wide
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={series.slaBuckets}
                          dataKey="value" nameKey="name"
                          innerRadius="38%" outerRadius="70%"
                          paddingAngle={4}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {series.slaBuckets.map((entry, index) => (
                            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip {...tooltipStyle} content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}

                {/* Backlog tab: full-width scatter */}
                {activeChart === 'backlog' && (
                  <ChartCard
                    title="Backlog Health Map"
                    subtitle="Each dot = one issue. X = age in days, Y = priority weight"
                    icon={Layers}
                    accentColor="#f59e0b"
                    wide
                  >
                    <ResponsiveContainer width="100%" height={400}>
                      <ScatterChart margin={{ top: 10, left: -10, right: 24 }}>
                        <CartesianGrid stroke="rgba(148,163,184,0.12)" />
                        <XAxis type="number" dataKey="x" name="Age (days)" stroke="var(--txt-muted)" tick={{ fontSize: 11 }} label={{ value: 'Age (days)', position: 'insideBottom', offset: -5, fill: 'var(--txt-muted)', fontSize: 11 }} />
                        <YAxis type="number" dataKey="y" name="Priority weight" stroke="var(--txt-muted)" tick={{ fontSize: 11 }} label={{ value: 'Priority', angle: -90, position: 'insideLeft', fill: 'var(--txt-muted)', fontSize: 11 }} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} {...tooltipStyle} content={<CustomTooltip />} />
                        <Scatter data={series.backlogScatter} fill="#f59e0b" opacity={0.75} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ── Role info footer ─────────────────────────────────── */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                marginTop: 40, padding: '16px 24px',
                background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', gap: 12,
                fontSize: '0.8rem', color: 'var(--txt-secondary)'
              }}
            >
              {isAdmin ? <Building2 size={14} style={{ color: 'var(--clr-primary)', flexShrink: 0 }} />
                : <Shield size={14} style={{ color: 'var(--clr-primary)', flexShrink: 0 }} />}
              <span>
                Showing <strong style={{ color: 'var(--txt-primary)' }}>{isAdmin ? 'platform-wide (global)' : 'your organization'}</strong> data
                for the <strong style={{ color: 'var(--txt-primary)' }}>last {range.replace('d', ' days')}</strong>.
                Export to Excel to slice data further.
              </span>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
