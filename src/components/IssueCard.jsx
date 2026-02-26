import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Building2, Navigation, X, Download, Maximize2, Copy, Check, User, Mail, Phone } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} title="Copy coordinates" style={{
      background: 'none', border: 'none', padding: 2, display: 'flex', cursor: 'pointer',
      color: copied ? 'var(--clr-primary)' : 'var(--txt-muted)', transition: 'color 0.2s',
    }}>
      {copied ? <Check size={10} /> : <Copy size={10} />}
    </button>
  );
}

// Lazy-load Leaflet for MapViewer
let L = null;

function ImageModal({ src, onClose, issueTitle }) {
  const handleDownload = async () => {
    try {
      // Use authenticated api instance to fetch the image as a blob
      const { data } = await api.get(src, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `issue_${issueTitle.replace(/\s+/g, '_')}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh', borderRadius: 16, overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}>
        <img src={src} alt="Full Issue" style={{ display: 'block', width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }} />
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
          <button onClick={handleDownload} className="btn btn-ghost btn-sm" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none' }} title="Download Image">
            <Download size={18} />
          </button>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none' }}>
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function MapViewerModal({ lat, lng, onClose }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    import('leaflet').then(module => {
      if (!mounted || !mapContainer.current || mapRef.current) return;
      L = module.default || module;

      // Icon fix
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainer.current, { attributionControl: false }).setView([lat, lng], 16);
      mapRef.current = map;

      // Satellite tiles
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
      }).addTo(map);

      // Labels layer
      L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19, opacity: 0.8
      }).addTo(map);

      L.marker([lat, lng]).addTo(map);
    });
    return () => {
      mounted = false;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [lat, lng]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        style={{ position: 'relative', width: '100%', maxWidth: 700, overflow: 'hidden', background: 'var(--bg-surface)', border: '1px solid var(--bg-glass-border)', borderRadius: 24, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bg-glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--txt-primary)' }}>Issue Location</h3>
          <button onClick={onClose} style={{ color: 'var(--txt-muted)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div ref={mapContainer} style={{ width: '100%', height: 400, background: '#111' }} />
        <div style={{ padding: '12px 20px', background: 'var(--bg-glass)', fontSize: '0.8rem', color: 'var(--txt-secondary)', display: 'flex', gap: 16 }}>
          <span>Lat: <strong>{lat}</strong></span>
          <span>Lng: <strong>{lng}</strong></span>
        </div>
      </motion.div>
    </div>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

const STATUS_LEFT_BORDER = {
  PENDING: '#f59e0b',
  IN_PROGRESS: '#6366f1',
  RESOLVED: '#10b981',
};

export default function IssueCard({ issue, actions, onClick }) {
  const { role, token } = useAuth();
  const [viewImage, setViewImage] = useState(false);
  const [viewMap, setViewMap] = useState(false);
  const hasImage = !!issue.has_image;
  const isAdminOrOrg = role === 'ADMIN' || role === 'AUTHORITY';
  const borderColor = STATUS_LEFT_BORDER[issue.status] || 'var(--bg-glass-border)';

  const imgBase = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/issues/${issue.id}/image`;
  const imgUrl = token ? `${imgBase}?token=${token}` : imgBase;

  return (
    <>
      <motion.div
        whileHover={{ y: -3, boxShadow: `0 8px 40px rgba(34,211,160,0.10)` }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        style={{
          background: 'var(--grad-card)',
          border: '1px solid var(--bg-glass-border)',
          borderLeft: `3px solid ${borderColor}`,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', gap: 0 }}>
          {/* Image preview */}
          {hasImage && (
            <div
              onClick={(e) => { e.stopPropagation(); setViewImage(true); }}
              style={{ width: 88, flexShrink: 0, position: 'relative', overflow: 'hidden', background: 'var(--bg-surface)', cursor: 'zoom-in' }}
            >
              <img
                src={imgUrl}
                alt="Issue"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.parentElement.style.display = 'none'; }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                <Maximize2 size={16} color="#fff" />
              </div>
            </div>
          )}

          <div style={{ flex: 1, padding: '18px 20px' }}>
            {/* Title + badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--txt-primary)', lineHeight: 1.35, flex: 1 }}>
                {issue.title}
              </h3>
              <StatusBadge status={issue.status} />
            </div>

            {/* Description */}
            <p style={{
              fontSize: 'var(--text-sm)', color: 'var(--txt-secondary)', marginBottom: 14, lineHeight: 1.6,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
              {issue.description}
            </p>

            {/* Meta row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              {issue.organization_name && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--txt-muted)', background: 'var(--bg-glass)', borderRadius: 6, padding: '3px 9px' }}>
                  <Building2 size={11} /> {issue.organization_name}
                </span>
              )}
              {issue.citizen_name ? (
                <span title="Reporter Name" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--txt-muted)', background: 'var(--bg-glass)', borderRadius: 6, padding: '3px 9px' }}>
                  <User size={11} /> {issue.citizen_name}
                </span>
              ) : issue.reporter_name ? (
                <span title="Reporter Name" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--txt-muted)', background: 'var(--bg-glass)', borderRadius: 6, padding: '3px 9px' }}>
                  <User size={11} /> {issue.reporter_name}
                </span>
              ) : null}

              {isAdminOrOrg && (
                <>
                  {issue.reporter_email && (
                    <span title="Reporter Email" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--txt-muted)', background: 'var(--bg-glass)', borderRadius: 6, padding: '3px 9px' }}>
                      <Mail size={11} /> {issue.reporter_email}
                    </span>
                  )}
                  {issue.reporter_phone && (
                    <span title="Reporter Phone" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--txt-muted)', background: 'var(--bg-glass)', borderRadius: 6, padding: '3px 9px' }}>
                      <Phone size={11} /> {issue.reporter_phone}
                    </span>
                  )}
                </>
              )}

              {/* GPS / Location Badge */}
              {issue.latitude && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setViewMap(true); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem',
                    color: 'var(--clr-primary)', background: 'rgba(34,211,160,0.08)',
                    border: '1px solid rgba(34,211,160,0.2)', borderRadius: 6, padding: '3px 9px',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,211,160,0.15)'; e.currentTarget.style.borderColor = 'rgba(34,211,160,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(34,211,160,0.08)'; e.currentTarget.style.borderColor = 'rgba(34,211,160,0.2)'; }}
                >
                  <Navigation size={11} />
                  GPS Attached
                  {isAdminOrOrg && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
                      <span style={{ color: 'var(--txt-muted)', fontSize: '0.65rem' }}>
                        ({Number(issue.latitude).toFixed(4)}, {Number(issue.longitude).toFixed(4)})
                      </span>
                      <CopyButton text={`${issue.latitude}, ${issue.longitude}`} />
                    </div>
                  )}
                </button>
              )}

              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--txt-muted)', marginLeft: 'auto' }}>
                <Clock size={11} /> {timeAgo(issue.created_at)}
              </span>
            </div>

            {/* Actions */}
            {actions && (
              <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--bg-glass-border)' }}>
                {actions}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {viewImage && (
          <ImageModal
            src={imgUrl}
            issueTitle={issue.title}
            onClose={() => setViewImage(false)}
          />
        )}
        {viewMap && issue.latitude && (
          <MapViewerModal
            lat={issue.latitude}
            lng={issue.longitude}
            onClose={() => setViewMap(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
