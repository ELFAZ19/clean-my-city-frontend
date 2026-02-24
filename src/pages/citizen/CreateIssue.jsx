import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Send, ArrowLeft, Navigation, AlertCircle, Map, X, CheckCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import Navbar from '../../components/Navbar';

// We lazy-load Leaflet so it doesn't SSR-crash
let L = null;

function MapPicker({ lat, lng, onChange }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markerRef    = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    import('leaflet').then(module => {
      if (!mounted || !containerRef.current || mapRef.current) return;
      L = module.default || module;

      // Fix default icon paths that Vite breaks
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const initLat = lat || 9.005401;
      const initLng = lng || 38.763611;

      const map = L.map(containerRef.current, { zoomControl: true, attributionControl: false }).setView([initLat, initLng], lat ? 15 : 12);
      mapRef.current = map;

      // Satellite tile layer (Esri WorldImagery — free, no key needed)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
        maxZoom: 19,
      }).addTo(map);

      // Street labels overlay
      L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19, opacity: 0.7,
      }).addTo(map);

      if (lat && lng) {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current.on('dragend', e => {
          const { lat: la, lng: lo } = e.target.getLatLng();
          onChange(la.toFixed(6), lo.toFixed(6));
        });
      }

      map.on('click', e => {
        const { lat: la, lng: lo } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([la, lo]);
        } else {
          markerRef.current = L.marker([la, lo], { draggable: true }).addTo(map);
          markerRef.current.on('dragend', ev => {
            const { lat: dla, lng: dlo } = ev.target.getLatLng();
            onChange(dla.toFixed(6), dlo.toFixed(6));
          });
        }
        onChange(la.toFixed(6), lo.toFixed(6));
      });

      setReady(true);
    });
    return () => {
      mounted = false;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markerRef.current = null; }
    };
  }, []); // eslint-disable-line

  // Fly to new pin location when lat/lng changes externally (GPS)
  useEffect(() => {
    if (mapRef.current && lat && lng) {
      mapRef.current.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else if (L) {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
        markerRef.current.on('dragend', e => {
          const { lat: la, lng: lo } = e.target.getLatLng();
          onChange(la.toFixed(6), lo.toFixed(6));
        });
      }
    }
  }, [lat, lng]); // eslint-disable-line

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--bg-glass-border)' }}>
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={containerRef} style={{ width: '100%', height: 340 }} />
      {!ready && (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--txt-muted)', fontSize: '0.85rem' }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--bg-glass-border)', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', marginRight: 12 }} />
          Loading satellite map…
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.65)', borderRadius: 20, padding: '5px 14px', fontSize: '0.72rem', color: '#fff', backdropFilter: 'blur(8px)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        {lat ? `📍 ${lat}, ${lng}` : 'Click or tap the map to drop a pin'}
      </div>
    </div>
  );
}

export default function CreateIssue() {
  const navigate = useNavigate();
  const [orgs, setOrgs]       = useState([]);
  const [form, setForm]       = useState({ title: '', description: '', organization_id: '', latitude: '', longitude: '' });
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSub]  = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(''); // Kept for safety, but using modal now
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [gpsLoading, setGPS]  = useState(false);
  const [showMap, setShowMap] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/organizations/public').then(({ data }) => {
      const raw = data?.data?.organizations ?? data?.organizations ?? data?.data ?? data;
      setOrgs(Array.isArray(raw) ? raw : []);
    }).catch(() => {});
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return setError('Image size must be less than 5MB');
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const captureGPS = () => {
    if (!navigator.geolocation) return setError('Geolocation not supported by your browser.');
    setGPS(true); setError('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(p => ({ ...p, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
        setGPS(false);
        setShowMap(true);
      },
      () => { setError('Could not get location. Please allow GPS access.'); setGPS(false); }
    );
  };

  const handleMapChange = (lat, lng) => setForm(p => ({ ...p, latitude: lat, longitude: lng }));

  const clearPin = () => setForm(p => ({ ...p, latitude: '', longitude: '' }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setSub(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('organization_id', form.organization_id);
      if (form.latitude)  formData.append('latitude', form.latitude);
      if (form.longitude) formData.append('longitude', form.longitude);
      if (image) formData.append('image', image);

      const { data } = await api.post('/issues', formData);
      
      if (data.isDuplicate) {
        setShowDuplicateModal(true);
      } else {
        navigate('/dashboard/citizen', { state: { created: true } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit issue. Please try again.');
    } finally { setSub(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 'clamp(80px,10vw,100px) 16px 60px' }}>
        <Link to="/dashboard/citizen" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--txt-secondary)', fontSize: '0.875rem', marginBottom: 28, transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--txt-secondary)'}>
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,5vw,2rem)', fontWeight: 800, color: 'var(--txt-primary)', marginBottom: 8 }}>
            Report an Issue
          </h1>
          <p style={{ color: 'var(--txt-secondary)', marginBottom: 32 }}>
            Describe the problem so the right organization can respond quickly.
          </p>

          <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--bg-glass-border)', borderRadius: 'var(--radius-xl)', padding: 'clamp(20px,5vw,36px)', backdropFilter: 'blur(20px)' }}>
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                  <AlertCircle size={16} style={{ color: 'var(--clr-danger)', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--clr-danger)' }}>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(34,211,160,0.1)', border: '1px solid rgba(34,211,160,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                  <CheckCircle size={16} style={{ color: 'var(--clr-primary)', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--clr-primary)' }}>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {/* Title */}
              <div className="field">
                <label>Issue Title *</label>
                <input id="issue-title" type="text" required placeholder="e.g. Broken street light on Main Street" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>

              {/* Organization */}
              <div className="field">
                <label>Responsible Organization *</label>
                {orgs.length === 0 ? (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--txt-secondary)', fontSize: '0.85rem' }}>
                    ⚠ Loading organizations… (if empty, no active organizations exist yet)
                  </div>
                ) : (
                  <select id="issue-org" required value={form.organization_id} onChange={e => setForm(p => ({ ...p, organization_id: e.target.value }))}>
                    <option value="" style={{ background: 'var(--bg-surface)' }}>Select an organization…</option>
                    {orgs.map(o => (
                      <option key={o.id} value={o.id} style={{ background: 'var(--bg-surface)' }}>{o.name}{o.category ? ` — ${o.category}` : ''}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Description */}
              <div className="field">
                <label>Description *</label>
                <textarea id="issue-desc" required rows={4} placeholder="Provide as much detail as possible…"
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  style={{ resize: 'vertical', minHeight: 100 }} />
              </div>

              {/* Image Upload */}
              <div className="field">
                <label>Attach Photo <span style={{ color: 'var(--txt-muted)', fontWeight: 400 }}>(optional)</span></label>
                {!preview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      height: 120, border: '2px dashed var(--bg-glass-border)', borderRadius: 'var(--radius-md)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 8, cursor: 'pointer', color: 'var(--txt-muted)', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--clr-primary)'; e.currentTarget.style.color = 'var(--txt-secondary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bg-glass-border)'; e.currentTarget.style.color = 'var(--txt-muted)'; }}
                  >
                    <Send size={24} style={{ opacity: 0.5 }} />
                    <span style={{ fontSize: '0.85rem' }}>Click to upload an image (max 5MB)</span>
                  </div>
                ) : (
                  <div style={{ position: 'relative', width: 'fit-content' }}>
                    <img src={preview} alt="Preview" style={{ width: 140, height: 140, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--bg-glass-border)' }} />
                    <button type="button" onClick={clearImage}
                      style={{ position: 'absolute', top: -10, right: -10, width: 28, height: 28, borderRadius: '50%', background: 'var(--clr-danger)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                      <X size={14} />
                    </button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
              </div>

              {/* Location */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--txt-secondary)' }}>
                    <MapPin size={14} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle', color: 'var(--clr-primary)' }} />
                    Location <span style={{ color: 'var(--txt-muted)', fontWeight: 400 }}>(optional but recommended)</span>
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowMap(v => !v)}
                      style={{ gap: 6, borderColor: showMap ? 'var(--clr-primary)' : 'var(--bg-glass-border)', color: showMap ? 'var(--clr-primary)' : 'var(--txt-secondary)' }}>
                      <Map size={13} /> {showMap ? 'Hide Map' : 'Open Map'}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={captureGPS} disabled={gpsLoading}
                      style={{ gap: 6, borderColor: 'rgba(34,211,160,0.35)', color: gpsLoading ? 'var(--txt-muted)' : 'var(--clr-primary)' }}>
                      <Navigation size={13} /> {gpsLoading ? 'Getting…' : 'My GPS'}
                    </button>
                    {form.latitude && (
                      <button type="button" onClick={clearPin}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--txt-muted)', padding: '4px 6px' }}>
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {showMap && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 12 }}>
                      <MapPicker
                        lat={form.latitude ? parseFloat(form.latitude) : null}
                        lng={form.longitude ? parseFloat(form.longitude) : null}
                        onChange={handleMapChange}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {form.latitude && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="field" style={{ flex: 1 }}>
                      <label>Latitude</label>
                      <input type="number" step="any" value={form.latitude} onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label>Longitude</label>
                      <input type="number" step="any" value={form.longitude} onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                <Link to="/dashboard/citizen" className="btn btn-outline" style={{ flex: '0 0 auto' }}>Cancel</Link>
                <motion.button id="issue-submit" type="submit" className="btn btn-primary" disabled={submitting}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ flex: 1, minWidth: 160, height: 48, opacity: submitting ? 0.7 : 1 }}>
                  {submitting
                    ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />Submitting…</span>
                    : <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}><Send size={16} /> Submit Report</span>
                  }
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
      <DuplicateModal isOpen={showDuplicateModal} onClose={() => navigate('/dashboard/citizen')} />
    </div>
  );
}
