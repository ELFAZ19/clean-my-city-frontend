import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  MapPin, Zap, Shield, Clock, CheckCircle, Users, BarChart3,
  ArrowRight, Star, ChevronDown, AlertTriangle, Droplets, Wifi,
  TreePine, Trash2, Construction, PlayCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ThreeHeroCanvas from '../components/ThreeHeroCanvas';
import './landing.css';

/* ── Animated counter ─────────────────────────────────── */
function Counter({ to, suffix = '', duration = 2 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const step = to / (duration * 60);
        let cur = 0;
        const t = setInterval(() => {
          cur += step;
          if (cur >= to) { setVal(to); clearInterval(t); }
          else setVal(Math.floor(cur));
        }, 1000 / 60);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ── Floating particle ────────────────────────────────── */
function Particle({ style, anim }) {
  return (
    <motion.div
      style={{
        position: 'absolute', borderRadius: '50%',
        background: 'var(--grad-brand)', opacity: 0.15,
        ...style,
      }}
      animate={{ y: [-20, 20, -20], x: [-10, 10, -10], scale: [1, 1.1, 1] }}
      transition={{ duration: anim.duration, repeat: Infinity, ease: 'easeInOut', delay: anim.delay }}
    />
  );
}

const PARTICLE_ANIMS = [
  { duration: 9.2, delay: 0.4 },
  { duration: 10.6, delay: 1.7 },
  { duration: 8.8, delay: 0.9 },
  { duration: 11.1, delay: 2.2 },
  { duration: 9.8, delay: 1.3 },
];

const FEATURES = [
  { icon: MapPin, color: '#22d3a0', title: 'GPS-Pinned Reports', desc: 'Attach exact coordinates to every issue so organizations find it immediately.', },
  { icon: Zap, color: '#6366f1', title: 'Smart Duplicate Detection', desc: 'AI-powered matching prevents flooding with duplicates—keeps queues clean.', },
  { icon: Shield, color: '#f59e0b', title: 'Government-Grade Security', desc: 'CSRF protection, bcrypt-12 hashing, CSP headers, HSTS, XSS sanitization, and zero info leakage.', },
  { icon: Clock, color: '#22d3a0', title: 'Real-Time Status Tracking', desc: 'Watch your issue move from PENDING → IN PROGRESS → RESOLVED in real time.', },
  { icon: BarChart3, color: '#6366f1', title: 'Analytics Dashboard', desc: 'Admins and organizations get live metrics on resolution times and issue volume.', },
  { icon: Users, color: '#f59e0b', title: 'Role-Based Access Control', desc: 'Citizens, Organizations, and Admins each get a tailored, secure workspace.', },
];

const STEPS = [
  { num: '01', icon: MapPin, title: 'Report an Issue', desc: 'Take a photo, add a description, and pin the GPS location. Done in 30 seconds.' },
  { num: '02', icon: Building2Icon, title: 'Routed to the Right Org', desc: 'The system routes your report to the responsible organization automatically.' },
  { num: '03', icon: CheckCircle, title: 'Track & Get Notified', desc: 'Follow the status live until your issue is marked Resolved.' },
];
function Building2Icon(p) { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="18" /><rect x="14" y="3" width="7" height="10" /><path d="M3 21h18" /></svg>; }

const CATEGORIES = [
  { icon: Droplets, label: 'Water & Sewage' },
  { icon: Zap, label: 'Electricity' },
  { icon: Construction, label: 'Roads & Paths' },
  { icon: Wifi, label: 'Public Services' },
  { icon: TreePine, label: 'Parks & Green' },
  { icon: Trash2, label: 'Waste & Litter' },
];

const STATS = [
  { value: 12400, suffix: '+', label: 'Issues Resolved' },
  { value: 98, suffix: '%', label: 'Satisfaction Rate' },
  { value: 340, suffix: '+', label: 'Organizations' },
  { value: 4.8, suffix: 'h', label: 'Avg. Response Time' },
];

const TESTIMONIALS = [
  { name: 'Abebe Girma', role: 'Addis Ababa Resident', text: 'A pothole I reported was fixed within 3 days. I never expected that kind of speed from local government.' },
  { name: 'Sara Tadesse', role: 'Municipal Officer', text: 'The queue system is a game changer. We can prioritize properly and close issues faster than ever before.' },
  { name: 'Kaleb Tesfaye', role: 'Citizen Reporter', text: 'I love being able to track every report live. Finally a platform that makes the city feel accountable.' },
];

/* ── Variants ─────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

export default function Landing() {
  const { isAuthenticated, role } = useAuth();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOp = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const featureBento = [
    { col: 7, row: 3 },
    { col: 5, row: 3 },
    { col: 4, row: 2 },
    { col: 4, row: 2 },
    { col: 4, row: 2 },
    { col: 12, row: 2 },
  ];

  return (
    <div style={{ background: 'var(--bg-base)', overflowX: 'hidden' }}>
      <Navbar />

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Gradient mesh background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <ThreeHeroCanvas progress={scrollYProgress} />
          <div style={{
            position: 'absolute', width: 800, height: 800, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,211,160,0.12) 0%, transparent 70%)',
            top: '-20%', left: '-10%', filter: 'blur(60px)',
          }} />
          <div style={{
            position: 'absolute', width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            bottom: '-10%', right: '-5%', filter: 'blur(60px)',
          }} />
          {/* Grid lines */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }} />
          {/* Particles */}
          <Particle anim={PARTICLE_ANIMS[0]} style={{ width: 8, height: 8, top: '20%', left: '15%' }} />
          <Particle anim={PARTICLE_ANIMS[1]} style={{ width: 5, height: 5, top: '60%', left: '25%' }} />
          <Particle anim={PARTICLE_ANIMS[2]} style={{ width: 10, height: 10, top: '35%', right: '20%' }} />
          <Particle anim={PARTICLE_ANIMS[3]} style={{ width: 6, height: 6, bottom: '25%', right: '35%' }} />
          <Particle anim={PARTICLE_ANIMS[4]} style={{ width: 4, height: 4, top: '50%', left: '50%' }} />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOp, position: 'relative', zIndex: 1, width: '100%' }}
        >
          <div className="container" style={{ textAlign: 'center', paddingTop: 100 }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(34,211,160,0.1)', border: '1px solid rgba(34,211,160,0.25)',
                borderRadius: 'var(--radius-full)', padding: '6px 16px', marginBottom: 32
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3a0', display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
              <span style={{ fontSize: '0.8rem', color: '#22d3a0', fontWeight: 600 }}>Now live in your city</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                lineHeight: 1.1, letterSpacing: '-0.02em',
                color: 'var(--txt-primary)', marginBottom: 24,
              }}
            >
              Your city, your voice.
              <br />
              <span className="text-gradient">Report. Track. Resolve.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'var(--txt-secondary)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}
            >
              CleanMyCity connects citizens directly with the organizations responsible for maintaining public infrastructure. Report issues in seconds, track them live.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link to={isAuthenticated && role === 'CITIZEN' ? "/dashboard/citizen/create" : "/register"} className="btn btn-primary btn-lg" style={{ gap: 10 }}>
                Report an Issue <ArrowRight size={18} />
              </Link>
              <Link to="/credentials" className="btn btn-outline btn-lg" style={{ gap: 10 }}>
                Explore with test users
              </Link>
              <a href="#how-it-works" className="btn btn-ghost btn-lg" style={{ gap: 10 }}>
                <PlayCircle size={18} /> See How It Works
              </a>

            </motion.div>

            {/* Category pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 56 }}
            >
              {CATEGORIES.map((c) => (
                <span key={c.label} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)',
                  borderRadius: 'var(--radius-full)', padding: '6px 14px',
                  fontSize: '0.8rem', color: 'var(--txt-secondary)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <c.icon size={13} style={{ color: 'var(--clr-primary)' }} />
                  {c.label}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>


      </section>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section id="stats" style={{ padding: '60px 0', borderTop: '1px solid var(--bg-glass-border)', borderBottom: '1px solid var(--bg-glass-border)', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div className="landing-statsHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px' }}>
              <span style={{ color: 'var(--clr-primary)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Impact at a glance
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--txt-primary)', marginTop: 8, lineHeight: 1.2 }}>
                Proven results from real cities
              </h2>
            </div>
            <p style={{ flex: '1 1 300px', fontSize: '0.95rem', color: 'var(--txt-secondary)', lineHeight: 1.6 }}>
              These numbers update as organizations close issues and citizens keep reporting.
            </p>
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="landing-statsLayout"
          >
            <motion.div
              variants={fadeUp}
              className="landing-statsMain"
            >
              <div className="landing-statsMainTop">
                <div className="landing-statTag">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--clr-primary-light)', boxShadow: '0 0 12px rgba(34,211,160,0.7)' }} />
                  Live resolution metrics
                </div>
                <div className="landing-statValue text-gradient">
                  <Counter to={STATS[0].value} suffix={STATS[0].suffix} />
                </div>
                <p className="landing-statLabel" style={{ marginTop: 10 }}>{STATS[0].label}</p>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--txt-secondary)', maxWidth: 360 }}>
                Aggregated across all connected municipalities using CleanMyCity.
              </p>
            </motion.div>

            <div className="landing-statsSide">
              {STATS.slice(1).map((s, idx) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  className={`landing-statsPill ${idx === 2 ? 'landing-statsPill--wide' : ''}`}
                >
                  <div className="landing-statsPillValue">
                    <Counter to={s.value} suffix={s.suffix} />
                  </div>
                  <div className="landing-statsPillLabel">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ FEATURES ═══════════════════════ */}
      <section id="features" className="section">
        <div className="container">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ color: 'var(--clr-primary)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Why CleanMyCity
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--txt-primary)', marginTop: 12, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              Built for cities. Designed for people.
            </h2>
            <p style={{ color: 'var(--txt-secondary)', marginTop: 16, maxWidth: 540, margin: '16px auto 0', fontSize: '1.05rem' }}>
              Every feature is engineered to close the gap between citizens and the organizations that serve them.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="landing-bento"
          >
            {FEATURES.map((f, idx) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="card landing-bentoItem"
                style={{
                  '--bento-col': featureBento[idx]?.col ?? 4,
                  '--bento-row': featureBento[idx]?.row ?? 2,
                  cursor: 'default',
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14, marginBottom: 20,
                  background: `${f.color}18`, border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="landing-featureTitle">{f.title}</h3>
                <p className="landing-featureDesc">{f.desc}</p>
                {idx === 0 && (
                  <div className="landing-featureMeta">
                    <span className="landing-featureChip">GPS-accurate</span>
                    <span className="landing-featureChip">Photo-first</span>
                    <span className="landing-featureChip">Sub-30s reporting</span>
                  </div>
                )}
                {idx === 3 && (
                  <div className="landing-featureMeta">
                    <span className="landing-featureChip">Live status</span>
                    <span className="landing-featureChip">Push notifications</span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section id="how-it-works" style={{ padding: '100px 0', background: 'var(--bg-surface)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(rgba(34,211,160,0.04) 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ color: 'var(--clr-accent-light)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              The Process
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--txt-primary)', marginTop: 12, letterSpacing: '-0.01em' }}>
              Three steps to a cleaner city
            </h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32, position: 'relative' }}
          >
            {STEPS.map((s) => (
              <motion.div key={s.num} variants={fadeUp} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'var(--grad-brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 40px rgba(34,211,160,0.3)',
                  }}>
                    <s.icon style={{ width: 32, height: 32, color: '#fff', strokeWidth: 1.5 }} />
                  </div>
                  <span style={{
                    position: 'absolute', top: -8, right: -8,
                    background: 'var(--bg-surface-2)', border: '1px solid var(--bg-glass-border)',
                    borderRadius: 8, padding: '2px 8px',
                    fontSize: '0.7rem', fontWeight: 700, color: 'var(--txt-muted)', letterSpacing: '0.05em',
                  }}>{s.num}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--txt-primary)', marginBottom: 12 }}>{s.title}</h3>
                <p style={{ color: 'var(--txt-secondary)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--txt-primary)', letterSpacing: '-0.01em' }}>
              People love it
            </h2>
            <p style={{ marginTop: 10, fontSize: '0.95rem', color: 'var(--txt-secondary)' }}>
              Real voices from citizens and city teams using CleanMyCity.
            </p>
          </motion.div>
          <div className="landing-testimonialMarquee">
            <div className="landing-testimonialTrack">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
                <div key={`${t.name}-${idx}`} className="landing-testimonialCard">
                  <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                    ))}
                  </div>
                  <p style={{ color: 'var(--txt-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                    "{t.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--txt-primary)', fontSize: '0.9rem' }}>{t.name}</div>
                      <div style={{ color: 'var(--txt-muted)', fontSize: '0.75rem' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ SECURITY & TRUST ═══════════════════════ */}
      <section style={{ padding: '100px 0', background: 'var(--bg-surface)', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Security & Trust
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--txt-primary)', marginTop: 12, lineHeight: 1.2 }}>
              Government-grade protection,{' '}
              <span className="text-gradient">built in</span>
            </h2>
            <p style={{ color: 'var(--txt-secondary)', marginTop: 14, maxWidth: 520, margin: '14px auto 0', fontSize: '0.95rem', lineHeight: 1.7 }}>
              Your data is shielded with enterprise-grade encryption and defense-in-depth architecture.
            </p>
          </motion.div>
        </div>

        {/* Marquee — scrolls RIGHT */}
        <div className="landing-securityMarquee">
          <div className="landing-securityTrack">
            {[...Array(2)].flatMap((_, setIdx) => [
              { icon: Shield, color: '#22d3a0', title: 'End-to-End Encryption', desc: 'TLS/HTTPS in transit · bcrypt-12 at rest' },
              { icon: AlertTriangle, color: '#f59e0b', title: 'CSRF Protection', desc: 'Cryptographic tokens on every request' },
              { icon: Shield, color: '#6366f1', title: 'Strict CSP & HSTS', desc: 'Content Security Policy · HSTS preload' },
              { icon: Users, color: '#22d3a0', title: 'Role-Based Access', desc: 'Server-enforced Citizen · Authority · Admin' },
              { icon: Clock, color: '#6366f1', title: 'Rate Limiting', desc: 'Per-IP throttling · capped payload sizes' },
              { icon: Zap, color: '#f59e0b', title: 'Zero Info Leakage', desc: 'No stack traces · no internals exposed' },
            ].map((item, idx) => (
              <div key={`${setIdx}-${idx}`} className="landing-securityCard">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${item.color}15`, border: `1px solid ${item.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <item.icon size={17} style={{ color: item.color }} />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--txt-primary)', margin: 0 }}>{item.title}</h3>
                </div>
                <p style={{ color: 'var(--txt-muted)', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
              </div>
            )))}
          </div>
        </div>

        {/* Compliance badges */}
        <div className="container">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}
          >
            {[
              { label: 'OWASP Top 10', color: '#22d3a0' },
              { label: 'NIST Framework', color: '#6366f1' },
              { label: 'ISO 27001', color: '#f59e0b' },
            ].map((b) => (
              <div key={b.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: `${b.color}10`, border: `1px solid ${b.color}30`,
                borderRadius: 'var(--radius-full)', padding: '7px 18px',
              }}>
                <Shield size={14} style={{ color: b.color }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: b.color }}>{b.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ═══════════════════════ CTA ═══════════════════════ */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            style={{
              background: 'linear-gradient(135deg, rgba(34,211,160,0.12) 0%, rgba(99,102,241,0.12) 100%)',
              border: '1px solid rgba(34,211,160,0.2)',
              borderRadius: 'var(--radius-xl)', padding: 'clamp(40px, 8vw, 80px)',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,160,0.15) 0%, transparent 70%)', top: '-50%', left: '-10%', filter: 'blur(40px)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--txt-primary)', letterSpacing: '-0.02em', marginBottom: 16 }}>
                Ready to make a difference?
              </h2>
              <p style={{ color: 'var(--txt-secondary)', fontSize: '1.1rem', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7 }}>
                Join thousands of citizens already building a cleaner, better-managed city together.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to={isAuthenticated && role === 'CITIZEN' ? "/dashboard/citizen/create" : "/register"} className="btn btn-primary btn-lg">
                  Report Your First Issue <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer style={{ borderTop: '1px solid var(--bg-glass-border)', padding: '40px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--grad-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={14} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem' }}>
              Clean<span style={{ color: 'var(--clr-primary)' }}>My</span>City
            </span>
          </div>
          <p style={{ color: 'var(--txt-muted)', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} CleanMyCity. Built to serve communities.
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms'].map(l => (
              <a key={l} href="#" style={{ color: 'var(--txt-muted)', fontSize: '0.8rem', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--clr-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--txt-muted)'}>{l}</a>
            ))}
            <a href="https://yeabsira-dejene19.web.app/" style={{ color: 'var(--txt-muted)', fontSize: '0.8rem', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'var(--clr-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--txt-muted)'}>developer</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
