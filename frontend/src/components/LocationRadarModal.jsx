import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Radio, Activity, ExternalLink, Shield, X, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import './LocationRadarModal.css';

const PRESET_LOCATIONS = [
  { name: 'Perambalur', lat: 11.2342, lng: 78.8821 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { name: 'Salem', lat: 11.6643, lng: 78.1460 },
  { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { name: 'Trichy', lat: 10.7905, lng: 78.7047 }
];

export default function LocationRadarModal({ isOpen, onClose, onSelectHospital }) {
  const [userLat, setUserLat] = useState(11.2342); // Default to Perambalur
  const [userLng, setUserLng] = useState(78.8821);
  const [locationName, setLocationName] = useState('Perambalur, TN');
  const [radiusKm, setRadiusKm] = useState(15);
  const [activeCategory, setActiveCategory] = useState('all');
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNearbyFacilities(userLat, userLng, radiusKm, activeCategory);
    }
  }, [isOpen, userLat, userLng, radiusKm, activeCategory]);

  const fetchNearbyFacilities = async (lat, lng, radius, cat) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: lat,
          lng: lng,
          radius_km: radius,
          category_filter: cat
        })
      });
      if (response.ok) {
        const data = await response.json();
        setFacilities(data.facilities || []);
      }
    } catch (err) {
      console.error("Failed to fetch nearby facilities:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLat(lat);
        setUserLng(lng);
        setGpsActive(true);
        setLocationName(`My GPS Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`);
        fetchNearbyFacilities(lat, lng, radiusKm, activeCategory);
      },
      (error) => {
        setLoading(false);
        alert("Unable to retrieve your location. Please check browser permissions or select a district preset below.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectPreset = (preset) => {
    setUserLat(preset.lat);
    setUserLng(preset.lng);
    setGpsActive(false);
    setLocationName(`${preset.name}, TN`);
  };

  if (!isOpen) return null;

  return (
    <div className="radar-modal-overlay" onClick={onClose}>
      <div className="radar-modal-container animate-scale-up" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="radar-header">
          <div className="radar-header-title">
            <Radio size={32} className="animate-pulse" />
            <div>
              <h2>Geo-Spatial Distance Radar</h2>
              <p>Discover verified hospitals, scan centres, diagnostic labs & pharmacies within your exact radius.</p>
            </div>
          </div>
          <button className="radar-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="radar-body">
          
          {/* Location & GPS Controls */}
          <div className="radar-controls-card">
            <div className="location-status-row">
              <div className="location-info">
                <MapPin size={24} style={{ color: '#0ea5e9' }} />
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Current Target Coordinates:</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'inherit' }}>{locationName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className={`gps-status-badge ${gpsActive ? 'badge-gps-active' : 'badge-gps-inactive'}`}>
                  {gpsActive ? <CheckCircle size={16} /> : <Radio size={16} />}
                  {gpsActive ? 'Live Device GPS Active' : 'Simulated District Mode'}
                </span>
                
                <button type="button" className="btn-detect-gps" onClick={handleGetGPS}>
                  <Navigation size={18} /> Turn On My Device Location (GPS)
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="location-presets">
              <span style={{ fontWeight: '700' }}>Quick Presets:</span>
              {PRESET_LOCATIONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`preset-chip ${locationName.includes(preset.name) ? 'active' : ''}`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  📍 {preset.name}
                </button>
              ))}
            </div>

            {/* Range Slider */}
            <div className="range-slider-section">
              <div className="range-label-row">
                <span style={{ fontWeight: '800', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={20} style={{ color: '#0ea5e9' }} /> Search Radius Distance:
                </span>
                <span className="range-value-display">
                  Within {radiusKm} KM
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="custom-range-slider"
              />

              <div className="range-presets-row">
                {[3, 5, 10, 15, 25, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`range-preset-btn ${radiusKm === val ? 'active' : ''}`}
                    onClick={() => setRadiusKm(val)}
                  >
                    {val} km Radius
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Google Maps Interactive View */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '2px solid #0ea5e9', marginBottom: '1.5rem', boxShadow: '0 8px 25px rgba(14, 165, 233, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin className="animate-bounce" size={20} style={{ color: '#0ea5e9' }} /> Google Maps Live Geo-Spatial View ({locationName})
              </h4>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', background: '#e0f2fe', color: '#0369a1', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
                📡 Active Radius: {radiusKm} KM Range
              </span>
            </div>
            <div style={{ height: '240px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative', background: '#e2e8f0' }}>
              <iframe
                title="Google Maps Radar View"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${userLat},${userLng}&z=13&output=embed`}
              ></iframe>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="radar-tabs">
            <button
              type="button"
              className={`radar-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              🌟 All Within Range ({facilities.length})
            </button>
            <button
              type="button"
              className={`radar-tab-btn ${activeCategory === 'hospital' ? 'active' : ''}`}
              onClick={() => setActiveCategory('hospital')}
            >
              🏥 Hospitals
            </button>
            <button
              type="button"
              className={`radar-tab-btn ${activeCategory === 'scan' ? 'active' : ''}`}
              onClick={() => setActiveCategory('scan')}
            >
              🔬 Scan Centres
            </button>
            <button
              type="button"
              className={`radar-tab-btn ${activeCategory === 'lab' ? 'active' : ''}`}
              onClick={() => setActiveCategory('lab')}
            >
              🧪 Diagnostic Labs
            </button>
            <button
              type="button"
              className={`radar-tab-btn ${activeCategory === 'pharmacy' ? 'active' : ''}`}
              onClick={() => setActiveCategory('pharmacy')}
            >
              💊 Pharmacies & Medicals
            </button>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#0ea5e9' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Scanning coordinates within {radiusKm} km radius...</h3>
            </div>
          ) : facilities.length > 0 ? (
            <div className="radar-results-grid">
              {facilities.map((item, idx) => (
                <div key={idx} className="radar-item-card animate-fadeIn" style={{ borderLeft: item.category === 'Hospital' ? '4px solid #0f6b6b' : '4px solid #0ea5e9' }}>
                  <div className="radar-item-header">
                    <div>
                      <h3 className="radar-item-name">{item.name}</h3>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: item.category === 'Hospital' ? '#0f6b6b' : '#0ea5e9', textTransform: 'uppercase' }}>
                        {item.category} • {item.type}
                      </span>
                    </div>
                    <div className="distance-badge" style={{ background: '#0f172a', color: '#38bdf8', border: '1px solid #38bdf8' }}>
                      📍 {item.distance_km} km away
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.4rem 0' }}>
                    {item.address}, {item.city}
                  </p>

                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'inherit', marginBottom: '0.8rem' }}>
                    📞 {item.phone}
                  </div>

                  {/* Google Maps Live Route & ETA Bar */}
                  <div style={{ display: 'flex', gap: '0.8rem', background: '#f8fafc', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: '700', fontSize: '0.85rem', flex: '1 1 110px' }}>
                      <span style={{ fontSize: '1.2rem' }}>🚗</span>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Car / Ambulance</div>
                        <div>~{item.travel_time_car_mins || Math.max(2, Math.round(item.distance_km * 2.2 + 2))} mins</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: '700', fontSize: '0.85rem', flex: '1 1 110px' }}>
                      <span style={{ fontSize: '1.2rem' }}>🛵</span>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Two-Wheeler</div>
                        <div>~{item.travel_time_bike_mins || Math.max(1, Math.round(item.distance_km * 1.7 + 1))} mins</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Live Route & Profile */}
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: 'auto' }}>
                    <a
                      href={item.google_directions_url || `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${item.lat},${item.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff',
                        padding: '0.6rem 0.9rem',
                        borderRadius: '8px',
                        fontWeight: '800',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        textDecoration: 'none',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        flex: '1 1 160px'
                      }}
                    >
                      <Navigation size={15} /> Get Live Route & Directions ➔
                    </a>

                    <a
                      href={item.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        textDecoration: 'none',
                        border: '1px solid #cbd5e1'
                      }}
                    >
                      <MapPin size={15} /> Map Pin
                    </a>
                  </div>

                  <div className="radar-item-footer" style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {item.website ? (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0ea5e9', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        🌐 Official Website <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        ℹ️ No official website listed
                      </span>
                    )}

                    {item.category === 'Hospital' && onSelectHospital && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectHospital(item);
                        }}
                        style={{ padding: '0.45rem 0.9rem', background: '#0f6b6b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 10px rgba(15, 107, 107, 0.25)' }}
                      >
                        Select Hospital ➔
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #cbd5e1', color: 'var(--text-muted)' }}>
              <Radio size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.4rem', color: 'inherit', marginBottom: '0.5rem' }}>No facilities found within {radiusKm} km</h3>
              <p style={{ margin: 0 }}>Try expanding your search radius slider above (e.g., up to 25 km or 50 km) or selecting a different location preset!</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
