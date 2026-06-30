import React, { useState } from 'react';
import { Map, List as ListIcon, ShieldCheck, MapPin, Award, CheckCircle, HelpCircle, ArrowLeft } from 'lucide-react';

export default function Results({
  results,
  mappedCategory,
  onHospitalClick,
  onBack,
  compareList,
  onToggleCompare,
  onCompareSubmit
}) {
  const [viewMode, setViewMode] = useState('list'); // list or map
  const [filterType, setFilterType] = useState('all'); // all, govt, private, trust
  const [filterAccreditation, setFilterAccreditation] = useState('all'); // all, JCI, NABH
  const [maxDistance, setMaxDistance] = useState(30);

  // Filter items locally for immediate feedback
  const filteredResults = results ? results.filter(item => {
    // Filter by type
    if (filterType !== 'all' && item.type !== filterType) return false;
    
    // Filter by accreditation
    if (filterAccreditation !== 'all') {
      const accList = item.accreditations.map(a => a.toLowerCase());
      if (!accList.includes(filterAccreditation.toLowerCase())) return false;
    }
    
    // Filter by distance
    if (item.distance_km > maxDistance) return false;
    
    return true;
  }) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          border: 'none',
          background: 'none',
          color: 'var(--primary-teal)',
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          <ArrowLeft size={16} /> Back to Search
        </button>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: viewMode === 'list' ? '1px solid var(--primary-teal)' : '1px solid var(--border-color)',
              backgroundColor: viewMode === 'list' ? 'var(--primary-teal-alpha)' : 'var(--white)',
              color: viewMode === 'list' ? 'var(--primary-teal)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <ListIcon size={16} /> List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: viewMode === 'map' ? '1px solid var(--primary-teal)' : '1px solid var(--border-color)',
              backgroundColor: viewMode === 'map' ? 'var(--primary-teal-alpha)' : 'var(--white)',
              color: viewMode === 'map' ? 'var(--primary-teal)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Map size={16} /> Stylized Map Grid
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Found recommendations for:</span>
        <span className="badge badge-teal" style={{ fontSize: '0.9rem' }}>{mappedCategory} Care</span>
      </div>

      {/* Main Grid: Filters on Left (25%), Cards on Right (75%) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '2rem'
      }} className="results-layout-grid">
        
        {/* Sidebar Filters */}
        <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Filter Results
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Hospital Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Hospital Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--white)',
                  color: 'var(--text-dark)'
                }}
              >
                <option value="all">All Types</option>
                <option value="private">Private</option>
                <option value="govt">Government</option>
                <option value="trust">Charitable Trust</option>
              </select>
            </div>

            {/* Accreditation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Quality Credentials</label>
              <select
                value={filterAccreditation}
                onChange={(e) => setFilterAccreditation(e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--white)',
                  color: 'var(--text-dark)'
                }}
              >
                <option value="all">All Accreditations</option>
                <option value="JCI">JCI Certified</option>
                <option value="NABH">NABH Accredited</option>
              </select>
            </div>

            {/* Distance Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.85rem' }}>
                <span>Max Distance</span>
                <span>{maxDistance} km</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="range-slider"
              />
            </div>
            
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1rem'
            }}>
              🚨 Disclaimer: Hospital index metrics represent proxies of clinical infrastructure, stability and ratings. All rankings represent estimation engines and do not constitute direct medical referrals.
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {filteredResults.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <HelpCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>No matching hospitals found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try expanding your distance limit or resetting filters.</p>
            </div>
          ) : viewMode === 'list' ? (
            filteredResults.map((item, idx) => (
              <div key={item.hospital_id} className="glass-card" style={{
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '80px 1fr 180px',
                gap: '1.5rem',
                alignItems: 'center'
              }}>
                {/* TQI Badge Circle */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--primary-teal-alpha)',
                  border: '2px solid var(--primary-teal)',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-teal)', lineHeight: 1 }}>
                    {Math.round(item.tqi_score)}
                  </span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--primary-teal-dark)', textTransform: 'uppercase' }}>
                    TQI
                  </span>
                </div>

                {/* Main details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{item.hospital_name}</h3>
                    <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>{item.type}</span>
                    {item.emergency_available && (
                      <span className="badge badge-coral" style={{ fontSize: '0.7rem' }}>24x7 Emergency</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <MapPin size={14} /> {item.distance_km} km away
                    </span>
                    {item.accreditations.length > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Award size={14} /> Accreditation: {item.accreditations.join(', ')}
                      </span>
                    )}
                    {item.insurance_coverage !== 'N/A' && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <ShieldCheck size={14} /> Insurance: {item.insurance_coverage}
                      </span>
                    )}
                  </div>

                  {/* Recommendations explanations */}
                  <div style={{
                    marginTop: '0.5rem',
                    backgroundColor: 'var(--bg-blue-gray)',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}>
                    <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                      Match Logic Explanation
                    </strong>
                    <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {item.explanation.slice(0, 3).map((exp, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dark)' }}>
                          <CheckCircle size={12} style={{ color: 'var(--primary-teal)', flexShrink: 0 }} /> {exp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right side CTAs */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem',
                  textAlign: 'right'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Estimated Cost</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-teal)' }}>
                      {item.estimated_cost_min ? `₹${item.estimated_cost_min.toLocaleString()} - ₹${item.estimated_cost_max.toLocaleString()}` : 'N/A'}
                    </span>
                  </div>

                  <button
                    onClick={() => onHospitalClick(item.hospital_id)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', width: '100%', padding: '0.5rem' }}
                  >
                    View Details
                  </button>

                  {/* Compare Checkbox */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.4rem',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}>
                    <input
                      type="checkbox"
                      checked={compareList.some(c => c.id === item.hospital_id)}
                      onChange={() => onToggleCompare(item)}
                      style={{ cursor: 'pointer' }}
                    />
                    Add to Compare
                  </label>
                </div>
              </div>
            ))
          ) : (
            /* Stylized Interactive Map Grid */
            <div className="glass-panel" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '1.1rem', width: '100%' }}>Stylized Proximity Map (Radius from Center)</h3>
              
              <div style={{
                position: 'relative',
                width: '100%',
                height: '450px',
                backgroundColor: 'var(--bg-blue-gray)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Distance concentric circles */}
                <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', border: '1.5px dashed var(--border-color)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', border: '1.5px dashed var(--border-color)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '50%', border: '1.5px dashed var(--border-color)', pointerEvents: 'none' }}></div>
                
                {/* Distance indicators */}
                <span style={{ position: 'absolute', top: '105px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>10 km</span>
                <span style={{ position: 'absolute', top: '180px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>5 km</span>
                
                {/* Center Patient Coordinate pin */}
                <div style={{
                  position: 'absolute',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    backgroundColor: 'var(--primary-teal)',
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px var(--primary-teal)',
                    border: '2px solid white'
                  }}>
                    🏠
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--primary-teal)', backgroundColor: 'var(--white)', padding: '0.1rem 0.3rem', borderRadius: '4px', marginTop: '0.2rem', boxShadow: 'var(--shadow-sm)' }}>
                    Search Center
                  </span>
                </div>

                {/* Plot filtered hospitals relative to center */}
                {filteredResults.map((item, idx) => {
                  // Generate coordinates inside the 450x450 map box
                  // Use small offsets of actual coords
                  const scale = 12; // pixels per km
                  // We simulate angles programmatically to spread them beautifully
                  const angle = (idx * (360 / filteredResults.length)) * (Math.PI / 180);
                  const radius = Math.min(item.distance_km * scale, 190);
                  
                  const x = radius * Math.cos(angle);
                  const y = radius * Math.sin(angle);
                  
                  return (
                    <div
                      key={item.hospital_id}
                      style={{
                        position: 'absolute',
                        transform: `translate(${x}px, ${y}px)`,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: 5
                      }}
                      onClick={() => onHospitalClick(item.hospital_id)}
                      className="map-marker-pin"
                    >
                      <div style={{
                        backgroundColor: 'var(--white)',
                        border: '2px solid var(--primary-teal)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '20px',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        transition: 'var(--transition)'
                      }} className="marker-hover">
                        <span style={{ color: 'var(--primary-teal)' }}>🏥</span>
                        <span>TQI {Math.round(item.tqi_score)}</span>
                      </div>
                      <span style={{
                        fontSize: '0.65rem',
                        color: 'var(--text-dark)',
                        fontWeight: '600',
                        maxWidth: '90px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        padding: '0 0.2rem',
                        borderRadius: '2px'
                      }}>
                        {item.hospital_name}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 Click on any hospital pin to view details and treatment costs.</p>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Dock (Shows at bottom when items selected) */}
      {compareList.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--white)',
          borderTop: '2px solid var(--primary-teal)',
          boxShadow: '0 -4px 15px rgba(0,0,0,0.1)',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 80,
          animation: 'slideUp 0.25s ease-out'
        }} className="compare-dock-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--primary-teal)' }}>Hospital Comparison ({compareList.length}/3)</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {compareList.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'var(--bg-blue-gray)',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <span>{item.name}</span>
                  <button onClick={() => onToggleCompare(item)} style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--coral-alert)',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}>×</button>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              onClick={onCompareSubmit}
              className="btn btn-primary"
              disabled={compareList.length < 2}
              style={{
                fontSize: '0.9rem',
                opacity: compareList.length < 2 ? 0.5 : 1,
                cursor: compareList.length < 2 ? 'not-allowed' : 'pointer'
              }}
            >
              Compare Side-by-Side
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
