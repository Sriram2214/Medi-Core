import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, BarChart2, Edit2, ShieldAlert, Award, FileText, CheckCircle, Database } from 'lucide-react';

export default function Admin() {
  const [weights, setWeights] = useState({
    w_specialist: 0.25,
    w_infra: 0.20,
    w_satisfaction: 0.15,
    w_affordability: 0.10,
    w_accreditation: 0.10,
    w_emergency: 0.10,
    w_outcome: 0.10
  });

  const [activeSubTab, setActiveSubTab] = useState('weights');
  const [weightCategory, setWeightCategory] = useState('Cardiology');
  const [analytics, setAnalytics] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [isSavingWeights, setIsSavingWeights] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch weights for the selected category
  const fetchWeights = async (cat) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/weights');
      if (!response.ok) throw new Error();
      const data = await response.json();
      const matched = data.find(w => w.treatment_category.toLowerCase() === cat.toLowerCase());
      if (matched) {
        setWeights({
          w_specialist: matched.w_specialist,
          w_infra: matched.w_infra,
          w_satisfaction: matched.w_satisfaction,
          w_affordability: matched.w_affordability,
          w_accreditation: matched.w_accreditation,
          w_emergency: matched.w_emergency,
          w_outcome: matched.w_outcome
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/analytics');
      if (!response.ok) throw new Error();
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/hospitals');
      if (!response.ok) throw new Error();
      const data = await response.json();
      setHospitals(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWeights(weightCategory);
  }, [weightCategory]);

  useEffect(() => {
    if (activeSubTab === 'analytics') {
      fetchAnalytics();
    } else if (activeSubTab === 'hospitals') {
      fetchHospitals();
    }
  }, [activeSubTab]);

  const handleWeightChange = (key, value) => {
    setWeights(prev => ({
      ...prev,
      [key]: parseFloat(value)
    }));
  };

  const handleSaveWeights = async () => {
    setIsSavingWeights(true);
    setSuccessMsg('');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/weights?category=${weightCategory}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weights)
      });
      if (!response.ok) throw new Error('Failed to update weights');
      setSuccessMsg(`TQI coefficients for ${weightCategory} updated successfully. All scores recalculated in the database.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSavingWeights(false);
    }
  };

  // Helper to normalize sliders sum to 1.0 (visual cue)
  const sumWeights = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Title */}
      <div>
        <h1 style={{ fontSize: '2rem' }}>MediGuide AI Administrator Platform</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage TQI formula coefficients, review analytics dashboards, and configure hospital parameters.</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {[
          { id: 'weights', label: 'TQI Coefficients Editor', icon: <Sliders size={16} /> },
          { id: 'analytics', label: 'Search Analytics', icon: <BarChart2 size={16} /> },
          { id: 'hospitals', label: 'Hospital Registry Editor', icon: <Database size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
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
              color: activeSubTab === tab.id ? 'var(--primary-teal)' : 'var(--text-muted)',
              borderBottom: activeSubTab === tab.id ? '3px solid var(--primary-teal)' : '3px solid transparent',
              transition: 'var(--transition)'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content Container */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        
        {/* TQI Coefficients Editor */}
        {activeSubTab === 'weights' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ fontWeight: 'bold' }}>Select Specialty for Weights Override:</label>
                <select
                  value={weightCategory}
                  onChange={(e) => setWeightCategory(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--white)',
                    color: 'var(--text-dark)'
                  }}
                >
                  <option value="Cardiology">Cardiology Care</option>
                  <option value="Oncology">Oncology Care</option>
                  <option value="Orthopedics">Orthopedics Care</option>
                  <option value="Urology">Urology Care</option>
                  <option value="Gynecology">Gynecology Care</option>
                  <option value="Nephrology">Nephrology Care</option>
                  <option value="Default">Default Weights</option>
                </select>
              </div>

              <div style={{
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: Math.abs(sumWeights - 1.0) < 0.01 ? 'var(--primary-teal)' : 'var(--coral-alert)'
              }}>
                Coefficients Sum: {sumWeights.toFixed(2)} / 1.00
              </div>
            </div>

            {successMsg && (
              <div style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                color: 'rgb(34, 197, 94)',
                padding: '0.8rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <CheckCircle size={16} /> {successMsg}
              </div>
            )}

            {/* Sliders Grid */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem'
            }}>
              {[
                { key: 'w_specialist', label: 'Specialist Availability (w1)', desc: 'Factoring years of experience, qualifications, stability count' },
                { key: 'w_infra', label: 'Infrastructure Scope (w2)', desc: 'Factoring OTs count, ICU bed ratios, specialized cath-labs/MRI equipment' },
                { key: 'w_satisfaction', label: 'Patient Sentiment Satisfaction (w3)', desc: 'Factoring AI-sentiment score parsed from patient review text log' },
                { key: 'w_affordability', label: 'Affordability Match (w4)', desc: 'Factoring treatment cost deviation relative to city average cost' },
                { key: 'w_accreditation', label: 'Accreditation Tier (w5)', desc: 'Factoring NABH, JCI, ISO safety compliance score bands' },
                { key: 'w_emergency', label: 'Emergency Readiness (w6)', desc: 'Factoring 24x7 trauma desks, ICU availability, ambulance response' },
                { key: 'w_outcome', label: 'Outcome Proxy (w7)', desc: 'Factoring stable tenure, accreditations proxy' }
              ].map(coef => (
                <div key={coef.key} style={{
                  display: 'grid',
                  gridTemplateColumns: '250px 1fr 100px',
                  gap: '1.5rem',
                  alignItems: 'center',
                  paddingBottom: '0.8rem',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>{coef.label}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{coef.desc}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={weights[coef.key]}
                    onChange={(e) => handleWeightChange(coef.key, e.target.value)}
                    className="range-slider"
                  />
                  <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {Math.round(weights[coef.key] * 100)} %
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveWeights}
              className="btn btn-primary"
              disabled={isSavingWeights}
              style={{
                padding: '0.8rem 2rem',
                width: 'fit-content',
                fontWeight: 'bold',
                alignSelf: 'flex-end',
                marginTop: '1rem',
                opacity: isSavingWeights ? 0.7 : 1
              }}
            >
              <RefreshCw size={16} className={isSavingWeights ? 'pulse' : ''} />
              Save weights and Recalculate Database
            </button>
          </div>
        )}

        {/* Analytics view */}
        {activeSubTab === 'analytics' && analytics && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="grid-3">
              <div style={{ padding: '1.2rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Registry Hospitals</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>{analytics.total_hospitals} verified</h3>
              </div>
              <div style={{ padding: '1.2rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Searches Logged</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-teal)' }}>{analytics.searches_count} queries</h3>
              </div>
              <div style={{ padding: '1.2rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>System Avg TQI Score</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-teal-light)' }}>{analytics.average_tqi} / 100</h3>
              </div>
            </div>

            <div className="grid-2">
              {/* Queries stats */}
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BarChart2 size={16} style={{ color: 'var(--primary-teal)' }} /> High-Demand Treatment Specialties
                </h4>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-blue-gray)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.6rem' }}>Specialty</th>
                        <th style={{ padding: '0.6rem', textAlign: 'right' }}>Search count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.top_searches.length === 0 ? (
                        <tr><td colSpan="2" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No queries logged yet. Run some searches!</td></tr>
                      ) : (
                        analytics.top_searches.map((s, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.6rem', fontWeight: 600 }}>{s.query} Care</td>
                            <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary-teal)' }}>{s.count}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cities stats */}
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Database size={16} style={{ color: 'var(--primary-teal)' }} /> Hospital Registry By City
                </h4>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-blue-gray)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.6rem' }}>City</th>
                        <th style={{ padding: '0.6rem', textAlign: 'right' }}>Hospitals count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(analytics.city_distribution).map(([city, count], i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.6rem', fontWeight: 600 }}>{city}</td>
                          <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 'bold' }}>{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hospital list registry editor */}
        {activeSubTab === 'hospitals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Hospital Data Records</h3>
            
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-blue-gray)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '0.8rem' }}>Name</th>
                    <th style={{ padding: '0.8rem' }}>City</th>
                    <th style={{ padding: '0.8rem' }}>Type</th>
                    <th style={{ padding: '0.8rem' }}>Accreditation</th>
                    <th style={{ padding: '0.8rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map(h => (
                    <tr key={h.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.8rem', fontWeight: 'bold' }}>{h.name}</td>
                      <td style={{ padding: '0.8rem' }}>{h.city}</td>
                      <td style={{ padding: '0.8rem' }}><span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>{h.type}</span></td>
                      <td style={{ padding: '0.8rem' }}>{h.accreditation}</td>
                      <td style={{ padding: '0.8rem', color: 'var(--primary-teal)' }}>🟢 Verified</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
