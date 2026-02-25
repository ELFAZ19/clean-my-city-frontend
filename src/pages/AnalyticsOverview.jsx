import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, ScatterChart, Scatter
} from 'recharts';
import Navbar from '../components/Navbar';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#22d3a0', '#6366f1', '#f59e0b', '#0ea5e9'];

export default function AnalyticsOverview() {
  const [range, setRange] = useState('30d');
  const [limit, setLimit] = useState('100');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [series, setSeries] = useState({ timeseries: [], resolutionByCategory: [], slaBuckets: [], backlogScatter: [] });
  const { role } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const days = parseInt(range, 10);
        const isAdmin = role === 'ADMIN';
        const endpoint = isAdmin ? '/issues/analytics/global' : '/issues/analytics/organization';
        const { data } = await api.get(endpoint, { params: { range: days } });
        const payload = data?.data || {};
        setSeries({
          timeseries: payload.timeseries || [],
          resolutionByCategory: payload.resolutionByCategory || [],
          slaBuckets: payload.slaBuckets || [],
          backlogScatter: payload.backlogScatter || []
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [range, role]);

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ paddingTop: 90 }}>
        <section className="section">
          <div className="container">
            <header style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.8rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--clr-primary)', fontWeight: 700 }}>
                  Unified analytics
                </div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, color: 'var(--txt-primary)', marginTop: 8 }}>
                  Admin & Authority control center
                </h1>
                <p style={{ marginTop: 8, color: 'var(--txt-secondary)', maxWidth: 520 }}>
                  Explore live platform performance: reporting behavior, SLA compliance, and backlog health for every organization.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={range}
                  onChange={e => setRange(e.target.value)}
                  style={{ minWidth: 140 }}
                  className="field-select"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <select
                  value={limit}
                  onChange={e => setLimit(e.target.value)}
                  style={{ minWidth: 160 }}
                  className="field-select"
                >
                  <option value="50">Top 50 rows</option>
                  <option value="100">Top 100 rows</option>
                  <option value="250">Top 250 rows</option>
                </select>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Export analytics
                </button>
              </div>
            </header>

            {error && (
              <div style={{ marginBottom: 12, fontSize: '0.8rem', color: 'var(--clr-danger)' }}>
                {error}
              </div>
            )}
            <div className="analytics-grid">
              <div className="analytics-card analytics-card--wide">
                <div className="analytics-card-header">
                  <h2>Issue intake over time</h2>
                  <span>Citizens vs. authorities per day</span>
                </div>
                <div className="analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series.timeseries} margin={{ top: 10, left: -10, right: 10 }}>
                      <CartesianGrid stroke="rgba(148,163,184,0.2)" vertical={false} />
                      <XAxis dataKey="day" stroke="var(--txt-muted)" />
                      <YAxis stroke="var(--txt-muted)" />
                      <Tooltip contentStyle={{ background: '#020617', borderRadius: 12, border: '1px solid var(--bg-glass-border)' }} />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#22d3a0" strokeWidth={2.2} dot={false} />
                      <Line type="monotone" dataKey="resolved" stroke="#6366f1" strokeWidth={2.2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="analytics-card">
                <div className="analytics-card-header">
                  <h2>Resolved by category</h2>
                  <span>Across all authorities</span>
                </div>
                <div className="analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={series.resolutionByCategory} margin={{ top: 10, left: -20, right: 0 }}>
                      <CartesianGrid stroke="rgba(148,163,184,0.16)" vertical={false} />
                      <XAxis dataKey="category" stroke="var(--txt-muted)" />
                      <YAxis stroke="var(--txt-muted)" />
                      <Tooltip contentStyle={{ background: '#020617', borderRadius: 12, border: '1px solid var(--bg-glass-border)' }} />
                      <Bar dataKey="resolved" radius={[8, 8, 0, 0]} fill="url(#barGradient)" />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22d3a0" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="analytics-card">
                <div className="analytics-card-header">
                  <h2>SLA compliance</h2>
                  <span>Time-to-first-action buckets</span>
                </div>
                <div className="analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={series.slaBuckets}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={3}
                      >
                        {series.slaBuckets.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#020617', borderRadius: 12, border: '1px solid var(--bg-glass-border)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="analytics-card analytics-card--wide">
                <div className="analytics-card-header">
                  <h2>Backlog health</h2>
                  <span>Age (days) vs. priority weight</span>
                </div>
                <div className="analytics-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, left: -20, right: 0 }}>
                      <CartesianGrid stroke="rgba(148,163,184,0.18)" />
                      <XAxis type="number" dataKey="x" name="Age (days)" stroke="var(--txt-muted)" />
                      <YAxis type="number" dataKey="y" name="Priority weight" stroke="var(--txt-muted)" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#020617', borderRadius: 12, border: '1px solid var(--bg-glass-border)' }} />
                      <Scatter data={series.backlogScatter} fill="#22d3a0" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

