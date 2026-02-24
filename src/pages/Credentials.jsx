import { motion } from 'framer-motion';
import { Mail, Lock, Shield, Building2, Copy, Check, ArrowLeft, Key, Info, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CREDENTIALS = {
  admin: {
    role: 'Administrator',
    email: 'admin@fixmycity.com',
    password: 'Admin@123456',
    description: 'System-wide control. Manage organizations and users.'
  },
  authorities: [
    {
      name: 'Electricity Department',
      email: 'electricity@city.gov',
      password: 'Electricity@123',
      description: 'Manages electricity-related reports and infrastructure.'
    },
    {
      name: 'Water Department',
      email: 'water@city.gov',
      password: 'Water@123456',
      description: 'Manages water and sewage reports.'
    },
    {
      name: 'Roads Department',
      email: 'roads@city.gov',
      password: 'Roads@123456',
      description: 'Manages road maintenance and traffic report.'
    }
  ]
};

function CredentialCard({ title, email, password, description, icon: Icon, color }) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: `${color}10`, borderRadius: '50%', filter: 'blur(20px)' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '44px', 
          height: '44px', 
          borderRadius: '12px', 
          background: `${color}15`, 
          border: `1px solid ${color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={20} style={{ color: color }} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--txt-primary)' }}>{title}</h3>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--txt-secondary)', lineHeight: 1.5 }}>
        {description}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</span>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'between', 
            background: 'var(--bg-surface-2)', 
            padding: '8px 12px', 
            borderRadius: '8px',
            border: '1px solid var(--bg-glass-border)'
          }}>
            <code style={{ fontSize: '0.85rem', color: 'var(--clr-primary-light)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</code>
            <button onClick={() => copyToClipboard(email, 'email')} style={{ color: 'var(--txt-muted)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt-muted)'}>
              {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--txt-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</span>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'between', 
            background: 'var(--bg-surface-2)', 
            padding: '8px 12px', 
            borderRadius: '8px',
            border: '1px solid var(--bg-glass-border)'
          }}>
            <code style={{ fontSize: '0.85rem', color: 'var(--txt-primary)', flex: 1 }}>{password}</code>
            <button onClick={() => copyToClipboard(password, 'password')} style={{ color: 'var(--txt-muted)', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt-muted)'}>
              {copiedPassword ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Credentials() {
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />

      <section style={{ paddingTop: '140px', paddingBottom: '80px', position: 'relative' }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,160,0.08) 0%, transparent 70%)', top: '-10%', left: '-10%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', bottom: '10%', right: '-5%', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: '64px', position: 'relative', zIndex: 1 }}
          >
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--txt-secondary)', fontSize: '0.85rem', marginBottom: '24px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--txt-secondary)'}>
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--txt-primary)', marginBottom: '16px' }}>
              Explore the <span className="text-gradient">Platform</span>
            </h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--txt-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
              Use these pre-configured credentials to login and see how each role interacts with the system. Citizen accounts can be created at any time through the registration page.
            </p>

            {/* Password Change Notice */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                marginTop: '32px',
                padding: '12px 20px',
                borderRadius: '12px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--clr-danger)'
              }}
            >
              <AlertTriangle size={16} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Important: Please do not change the passwords for these shared accounts.</span>
            </motion.div>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {/* Admin Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Shield size={20} style={{ color: 'var(--clr-primary)' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--txt-primary)', fontFamily: 'var(--font-display)' }}>System Administrator</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                <CredentialCard 
                  title={CREDENTIALS.admin.role}
                  email={CREDENTIALS.admin.email}
                  password={CREDENTIALS.admin.password}
                  description={CREDENTIALS.admin.description}
                  icon={Shield}
                  color="#22d3a0"
                />
              </div>
            </div>

            {/* Authority Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Building2 size={20} style={{ color: 'var(--clr-accent)' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--txt-primary)', fontFamily: 'var(--font-display)' }}>City Authorities</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {CREDENTIALS.authorities.map((auth, idx) => (
                  <CredentialCard 
                    key={idx}
                    title={auth.name}
                    email={auth.email}
                    password={auth.password}
                    description={auth.description}
                    icon={Building2}
                    color="#6366f1"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ 
              marginTop: '64px', 
              padding: '24px', 
              borderRadius: '20px', 
              background: 'rgba(99,102,241,0.05)', 
              border: '1px solid rgba(99,102,241,0.15)',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start'
            }}
          >
            <Info size={20} style={{ color: 'var(--clr-accent)', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontWeight: 700, color: 'var(--txt-primary)', marginBottom: '8px' }}>Pro Tip: Role-Based Dashboard</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--txt-secondary)', lineHeight: 1.5 }}>
                When you log in with these accounts, you'll be redirected to a custom dashboard tailored to that specific role. Admins can see system-wide stats, while Authorities see issues specific to their department.
              </p>
              <Link to="/login" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
                Go to Login <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--bg-glass-border)', padding: '40px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
          <p style={{ color: 'var(--txt-muted)', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} CleanMyCity. Educational & Demonstration Purpose.
          </p>
        </div>
      </footer>
    </div>
  );
}
