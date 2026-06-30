import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Star, Info, Users, ShieldAlert, Award, FileText, CheckCircle2 } from 'lucide-react';

export default function HospitalProfile({
  hospitalId,
  onBack,
  onAddReview
}) {
  const [hospital, setHospital] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDept, setSelectedDept] = useState(null);
  
  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewDept, setReviewDept] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/hospitals/${hospitalId}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setHospital(data);
      if (data.departments && data.departments.length > 0) {
        setSelectedDept(data.departments[0]);
        setReviewDept(data.departments[0].name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (hospitalId) {
      fetchProfile();
    }
  }, [hospitalId]);

  if (!hospital) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }} className="pulse">
        <p>Loading clinical profile...</p>
      </div>
    );
  }

  // Handle Review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setErrorMessage('Please provide a review text.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/hospitals/${hospital.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewRating,
          text: reviewText,
          treatment: reviewDept
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to submit review');
      }
      
      setSuccessMessage('Thank you! Your review was successfully analyzed by our AI sentiment engine and TQI metrics have updated.');
      setReviewText('');
      setReviewRating(5);
      
      // Refresh hospital data to update reviews and scores
      fetchProfile();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to generate dynamic SVG TQI radar chart
  const renderRadarChart = (dept) => {
    if (!dept) return null;
    
    const scores = [
      { key: 'specialist', label: 'Specialist Availability', val: dept.tqi_specialist, weight: '25%' },
      { key: 'infra', label: 'Infrastructure', val: dept.tqi_infra, weight: '20%' },
      { key: 'satisfaction', label: 'Patient Satisfaction', val: dept.tqi_satisfaction, weight: '15%' },
      { key: 'affordability', label: 'Affordability Score', val: dept.tqi_affordability, weight: '10%' },
      { key: 'accreditation', label: 'Accreditation Credentials', val: dept.tqi_accreditation, weight: '10%' },
      { key: 'emergency', label: 'Emergency Readiness', val: dept.tqi_emergency, weight: '10%' },
      { key: 'outcome', label: 'Outcome Proxy', val: dept.tqi_outcome, weight: '10%' }
    ];
    
    const size = 300;
    const center = size / 2;
    const radius = 100;
    
    // Draw heptagon coordinates (7 points)
    const getCoords = (idx, scoreVal = 100) => {
      const angle = (idx * 2 * Math.PI / 7) - (Math.PI / 2); // Shift by 90deg to point upwards
      const r = (scoreVal / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle)
      };
    };

    // Construct grid heptagon paths
    const gridHeptagons = [20, 40, 60, 80, 100].map(level => {
      const points = [];
      for (let i = 0; i < 7; i++) {
        const { x, y } = getCoords(i, level);
        points.push(`${x},${y}`);
      }
      return points.join(' ');
    });

    // Construct actual values heptagon path
    const valuePoints = [];
    scores.forEach((s, idx) => {
      const { x, y } = getCoords(idx, s.val);
      valuePoints.push(`${x},${y}`);
    });
    const valuePath = valuePoints.join(' ');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary-teal-dark)', marginBottom: '0.5rem' }}>
          TQI Components Profile for {dept.name}
        </h4>
        
        <svg width={size} height={size} style={{ overflow: 'visible' }}>
          {/* Radial grid lines from center to outer heptagon vertices */}
          {Array.from({ length: 7 }).map((_, i) => {
            const outer = getCoords(i, 100);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--border-color)"
                strokeWidth="1"
              />
            );
          })}

          {/* Heptagonal concentric rings */}
          {gridHeptagons.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              fill="none"
              stroke="var(--border-color)"
              strokeWidth="1"
              strokeDasharray={idx === 4 ? "none" : "2,2"}
            />
          ))}

          {/* concentric grid text labels */}
          <text x={center + 5} y={center - 20} fontSize="8" fill="var(--text-muted)">20</text>
          <text x={center + 5} y={center - 40} fontSize="8" fill="var(--text-muted)">40</text>
          <text x={center + 5} y={center - 60} fontSize="8" fill="var(--text-muted)">60</text>
          <text x={center + 5} y={center - 80} fontSize="8" fill="var(--text-muted)">80</text>
          <text x={center + 5} y={center - 100} fontSize="8" fill="var(--text-muted)">100</text>

          {/* Actual value polygon */}
          <polygon
            points={valuePath}
            fill="rgba(15, 107, 107, 0.25)"
            stroke="var(--primary-teal)"
            strokeWidth="2"
          />

          {/* Dots on vertices */}
          {scores.map((s, idx) => {
            const { x, y } = getCoords(idx, s.val);
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="4"
                fill="var(--primary-teal)"
                stroke="white"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Text Labels along vertices */}
          {scores.map((s, idx) => {
            const labelCoords = getCoords(idx, 125); // Offset label further outward
            // Adjust text anchoring based on location
            let textAnchor = 'middle';
            if (labelCoords.x < center - 10) textAnchor = 'end';
            if (labelCoords.x > center + 10) textAnchor = 'start';
            
            return (
              <g key={idx}>
                <text
                  x={labelCoords.x}
                  y={labelCoords.y}
                  fontSize="9"
                  fontWeight="bold"
                  fill="var(--text-dark)"
                  textAnchor={textAnchor}
                >
                  {s.label} ({Math.round(s.val)})
                </text>
                <text
                  x={labelCoords.x}
                  y={labelCoords.y + 10}
                  fontSize="7"
                  fill="var(--text-muted)"
                  textAnchor={textAnchor}
                >
                  Weight: {s.weight}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Back button */}
      <div>
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
          <ArrowLeft size={16} /> Back to Search Results
        </button>
      </div>

      {/* Hospital Profile Hero Details */}
      <div className="glass-panel" style={{
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <h1 style={{ fontSize: '2rem' }}>{hospital.name}</h1>
            <span className="badge badge-teal">{hospital.type}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            📍 {hospital.address} | Lat: {hospital.lat.toFixed(4)}, Lng: {hospital.lng.toFixed(4)}
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            <span>📞 <strong>Phone:</strong> {hospital.phone}</span>
            <span>✉️ <strong>Email:</strong> {hospital.email}</span>
            <span>🌐 <strong>Web:</strong> <a href={`https://${hospital.website}`} target="_blank" style={{ color: 'var(--primary-teal)' }}>{hospital.website}</a></span>
          </div>
        </div>

        {/* Dynamic Accreditations badges */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {hospital.accreditation.split(',').map((acc, i) => (
              <span key={i} className="badge badge-coral" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                🏆 {acc} Certified
              </span>
            ))}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last updated: {new Date(hospital.last_updated).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tabs list selector */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        gap: '1rem'
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: <Info size={16} /> },
          { id: 'departments', label: 'Departments & TQI', icon: <Award size={16} /> },
          { id: 'doctors', label: 'Specialist Doctors', icon: <Users size={16} /> },
          { id: 'costs', label: 'Treatment Costs', icon: <FileText size={16} /> },
          { id: 'reviews', label: 'Reviews & Feedback', icon: <Star size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.8rem 1rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: activeTab === tab.id ? 'var(--primary-teal)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '3px solid var(--primary-teal)' : '3px solid transparent',
              transition: 'var(--transition)'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="grid-3">
              <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', textTransform: 'uppercase' }}>Total Beds</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{hospital.total_beds}</span>
              </div>
              <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', textTransform: 'uppercase' }}>ICU Beds</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--coral-alert)' }}>{hospital.icu_beds}</span>
              </div>
              <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', textTransform: 'uppercase' }}>Operation Theatres</span>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-teal)' }}>{hospital.ot_count}</span>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>Accepted Insurance Panels (Cashless Network)</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {hospital.insurance_panels.split(',').map((panel, idx) => (
                  <span key={idx} style={{
                    backgroundColor: 'var(--bg-blue-gray)',
                    border: '1px solid var(--border-color)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 500
                  }}>
                    💳 {panel}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>Accreditations and Licensures</h3>
              <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li><strong>NABH</strong>: National Accreditation Board for Hospitals & Healthcare Providers (highest Indian clinical standard).</li>
                {hospital.accreditation.includes('JCI') && (
                  <li><strong>JCI</strong>: Joint Commission International (Gold standard for international patient safety protocols).</li>
                )}
                <li><strong>ISO 9001</strong>: Standards compliance certification for facility quality control.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Departments & TQI Radar */}
        {activeTab === 'departments' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '250px 1fr',
            gap: '2rem'
          }} className="results-layout-grid">
            
            {/* Dept checklist list on left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Available Departments</h4>
              {hospital.departments.map(dept => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDept(dept)}
                  style={{
                    padding: '0.8rem',
                    borderRadius: '8px',
                    border: selectedDept?.id === dept.id ? '1.5px solid var(--primary-teal)' : '1px solid var(--border-color)',
                    backgroundColor: selectedDept?.id === dept.id ? 'var(--primary-teal-alpha)' : 'var(--white)',
                    color: selectedDept?.id === dept.id ? 'var(--primary-teal)' : 'var(--text-dark)',
                    textAlign: 'left',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{dept.name}</span>
                  <span className="badge badge-teal" style={{ padding: '0.15rem 0.4rem' }}>TQI {Math.round(dept.tqi_score)}</span>
                </button>
              ))}
            </div>

            {/* Radar and department details on right */}
            {selectedDept && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 320px',
                gap: '2rem'
              }} className="results-layout-grid">
                
                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.4rem' }}>{selectedDept.name} Department</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Head of Department: <strong>{selectedDept.head_doctor}</strong></p>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>Treatments and Surgeries Performed</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {selectedDept.treatments_offered.split(',').map((t, idx) => (
                        <span key={idx} style={{
                          backgroundColor: 'var(--primary-teal-alpha)',
                          color: 'var(--primary-teal)',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 500
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>Specialized Equipment</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {selectedDept.equipment.split(',').map((e, idx) => (
                        <span key={idx} style={{
                          backgroundColor: 'var(--bg-blue-gray)',
                          border: '1px solid var(--border-color)',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem'
                        }}>
                          ⚙️ {e}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Radar chart */}
                <div>
                  {renderRadarChart(selectedDept)}
                </div>

              </div>
            )}

          </div>
        )}

        {/* Tab 3: Specialists Doctors */}
        {activeTab === 'doctors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Active Medical Specialists</h3>
            
            <div className="grid-2">
              {hospital.doctors.map((doc, idx) => (
                <div key={idx} style={{
                  padding: '1.2rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  backgroundColor: 'var(--white)'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    backgroundColor: 'var(--primary-teal-alpha)',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    👨‍⚕️
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Dr. {doc.name}</h4>
                    <span className="badge badge-teal" style={{ width: 'fit-content', fontSize: '0.65rem' }}>{doc.specialty}</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      🎓 <strong>Qual:</strong> {doc.qualification}<br />
                      💼 <strong>Experience:</strong> {doc.experience_years} years<br />
                      🗣️ <strong>Languages:</strong> {doc.languages}<br />
                      ⏳ <strong>Tenure at Hospital:</strong> {doc.tenure_years} years (Tenure Stability Score: {doc.tenure_years >= 5 ? '✅ High' : '⚠️ Moderate'})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Treatment Costs */}
        {activeTab === 'costs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Estimated Treatment Costs (Cashless / Reimbursement Bands)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              These range bands are compiled from the hospital rate cards and validated claims logs. Check with your insurance company to see what portion of these costs is covered under your plan.
            </p>

            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              marginTop: '1rem'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.8rem' }}>Treatment Name</th>
                  <th style={{ padding: '0.8rem' }}>Min Cost</th>
                  <th style={{ padding: '0.8rem' }}>Max Cost</th>
                  <th style={{ padding: '0.8rem' }}>Average Estimate</th>
                </tr>
              </thead>
              <tbody>
                {hospital.cost_estimates.map((c, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.8rem', fontWeight: 600 }}>{c.treatment_name}</td>
                    <td style={{ padding: '0.8rem' }}>₹{c.cost_min.toLocaleString()}</td>
                    <td style={{ padding: '0.8rem' }}>₹{c.cost_max.toLocaleString()}</td>
                    <td style={{ padding: '0.8rem', color: 'var(--primary-teal)', fontWeight: 'bold' }}>
                      ₹{Math.round((c.cost_min + c.cost_max) / 2).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Reviews & AI Sentiment */}
        {activeTab === 'reviews' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 350px',
            gap: '2rem'
          }} className="results-layout-grid">
            
            {/* Reviews list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Patient Reviews & Testimonials</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {hospital.reviews.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No reviews submitted yet.</p>
                ) : (
                  hospital.reviews.map(rev => (
                    <div key={rev.id} style={{
                      padding: '1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-blue-gray)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < rev.rating ? 'var(--primary-teal)' : 'none'}
                              color={i < rev.rating ? 'var(--primary-teal)' : 'var(--text-muted)'}
                            />
                          ))}
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{rev.treatment} Care</span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(rev.date).toLocaleDateString()}</span>
                          
                          {/* Sentiment Tag */}
                          <span className="badge" style={{
                            fontSize: '0.65rem',
                            backgroundColor: rev.sentiment_score >= 65 ? 'rgba(34, 197, 94, 0.15)' : rev.sentiment_score <= 40 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                            color: rev.sentiment_score >= 65 ? 'rgb(34, 197, 94)' : rev.sentiment_score <= 40 ? 'rgb(239, 68, 68)' : 'rgb(234, 179, 8)'
                          }}>
                            {rev.sentiment_score >= 65 ? '😊 Positive' : rev.sentiment_score <= 40 ? '😞 Negative' : '😐 Neutral'}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>"{rev.text}"</p>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Verified Review Score: {Math.round(rev.sentiment_score)}/100</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Write review form on right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--primary-teal-alpha)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Star size={18} style={{ color: 'var(--primary-teal)' }} /> Submit Patient Review
                </h3>
                
                {successMessage && (
                  <div style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    color: 'rgb(34, 197, 94)',
                    padding: '0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <CheckCircle2 size={16} /> {successMessage}
                  </div>
                )}
                
                {errorMessage && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: 'rgb(239, 68, 68)',
                    padding: '0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    marginBottom: '1rem'
                  }}>
                    ⚠️ {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Rating selection */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Your Star Rating</label>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {[1, 2, 3, 4, 5].map(stars => (
                        <button
                          key={stars}
                          type="button"
                          onClick={() => setReviewRating(stars)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          <Star
                            size={24}
                            fill={stars <= reviewRating ? 'var(--primary-teal)' : 'none'}
                            color={stars <= reviewRating ? 'var(--primary-teal)' : 'var(--text-muted)'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specialty selection */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Select Treatment Category</label>
                    <select
                      value={reviewDept}
                      onChange={(e) => setReviewDept(e.target.value)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--white)',
                        color: 'var(--text-dark)'
                      }}
                    >
                      {hospital.departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name} Care</option>
                      ))}
                    </select>
                  </div>

                  {/* Review Text */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Review Description</label>
                    <textarea
                      placeholder="Write details about doctor care, wait times, costs..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows="4"
                      style={{
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        outline: 'none',
                        fontSize: '0.9rem',
                        resize: 'none'
                      }}
                    />
                  </div>

                  {/* Submit review */}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '0.7rem',
                      fontWeight: 'bold',
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? 'Analyzing text...' : 'Submit and Recalculate TQI'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

      </div>
      
    </div>
  );
}
