import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Printer, Award, Shield, Check, X, ShieldAlert } from 'lucide-react';

export default function Compare({
  compareIds,
  mappedCategory,
  onBack,
  onRemove
}) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  useEffect(() => {
    const fetchCompareData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/compare?ids=${compareIds.join(',')}`);
        if (!response.ok) throw new Error('Failed to fetch comparison');
        const data = await response.json();
        setHospitals(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (compareIds && compareIds.length > 0) {
      fetchCompareData();
    }
  }, [compareIds]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }} className="pulse">
        <p>Loading comparative analytics...</p>
      </div>
    );
  }

  if (hospitals.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>No hospitals selected for comparison.</p>
        <button onClick={onBack} className="btn btn-primary" style={{ marginTop: '1rem' }}>Return to Search</button>
      </div>
    );
  }

  // Find best (highest) values to highlight them in green
  const getDeptInfo = (hosp, cat) => {
    return hosp.departments.find(d => d.name.toLowerCase() === cat.toLowerCase()) || null;
  };

  const getTqi = (hosp) => {
    const d = getDeptInfo(hosp, mappedCategory);
    return d ? d.tqi_score : 70;
  };

  const getMaxSpecialists = () => {
    return Math.max(...hospitals.map(h => {
      const d = getDeptInfo(h, mappedCategory);
      return d ? d.specialist_count : 0;
    }));
  };

  const getMinCost = () => {
    // Find treatment cost estimate average
    const avgCosts = hospitals.map(h => {
      const de = getDeptInfo(h, mappedCategory);
      const categoryName = de ? de.name : mappedCategory;
      const cEst = h.cost_estimates.find(c => c.treatment_name.toLowerCase().includes(categoryName.toLowerCase()));
      if (cEst) return (cEst.cost_min + cEst.cost_max) / 2;
      return 9999999;
    });
    return Math.min(...avgCosts);
  };

  const maxTqi = Math.max(...hospitals.map(getTqi));
  const maxSpecialists = getMaxSpecialists();
  const minCost = getMinCost();

  const handleShare = () => {
    // Mock generating a shareable link
    const queryIds = hospitals.map(h => h.id).join(',');
    const shareUrl = `${window.location.origin}/compare?ids=${queryIds}&category=${mappedCategory}`;
    navigator.clipboard.writeText(shareUrl);
    setShareLinkCopied(true);
    setTimeout(() => setShareLinkCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
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
          <ArrowLeft size={16} /> Back to Results
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleShare} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <Share2 size={14} /> {shareLinkCopied ? 'Link Copied!' : 'Send to Family'}
          </button>
          <button onClick={handlePrint} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
            <Printer size={14} /> Print Comparison
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Side-by-Side Comparison for:</span>
        <span className="badge badge-teal" style={{ fontSize: '0.9rem' }}>{mappedCategory} Specialty</span>
      </div>

      {/* Comparison Grid */}
      <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left'
        }} className="compare-table-view">
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', width: '220px', color: 'var(--text-muted)' }}>Hospital Parameter</th>
              
              {hospitals.map(hosp => (
                <th key={hosp.id} style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem' }}>{hosp.name}</h3>
                      <span className="badge badge-teal" style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>{hosp.type}</span>
                    </div>
                    <button
                      onClick={() => onRemove(hosp)}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: 'var(--coral-alert)',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      ×
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            
            {/* 1. TQI SCORE */}
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--primary-teal-alpha)' }}>
              <td style={{ padding: '1rem', fontWeight: 'bold' }}>Treatment Quality Index (TQI)</td>
              {hospitals.map(h => {
                const score = getTqi(h);
                const isBest = score === maxTqi;
                return (
                  <td key={h.id} style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        color: isBest ? 'var(--primary-teal)' : 'var(--text-dark)'
                      }}>
                        {Math.round(score)}/100
                      </span>
                      {isBest && <span className="badge badge-teal" style={{ fontSize: '0.6rem' }}>🏆 Top Rank</span>}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* 2. SPEC CATEGORY SUB-METRICS */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem', fontWeight: 600 }}>Specialist Doctors count</td>
              {hospitals.map(h => {
                const d = getDeptInfo(h, mappedCategory);
                const count = d ? d.specialist_count : 0;
                const isBest = count === maxSpecialists;
                return (
                  <td key={h.id} style={{ padding: '1rem' }}>
                    <span style={{
                      fontWeight: isBest ? 'bold' : 'normal',
                      color: isBest ? 'var(--primary-teal)' : 'inherit'
                    }}>
                      {count} active specialists
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* 3. HEAD DOCTOR */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem', fontWeight: 600 }}>Head of Department</td>
              {hospitals.map(h => {
                const d = getDeptInfo(h, mappedCategory);
                return (
                  <td key={h.id} style={{ padding: '1rem' }}>
                    {d ? d.head_doctor : 'N/A'}
                  </td>
                );
              })}
            </tr>

            {/* 4. BED FACILITIES */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem', fontWeight: 600 }}>ICU / General Beds capacity</td>
              {hospitals.map(h => (
                <td key={h.id} style={{ padding: '1rem' }}>
                  <span>🛏️ {h.icu_beds} ICU Beds / {h.total_beds} Total Beds</span>
                </td>
              ))}
            </tr>

            {/* 5. OPERATION THEATRES */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem', fontWeight: 600 }}>Operation Theatres (OT)</td>
              {hospitals.map(h => (
                <td key={h.id} style={{ padding: '1rem' }}>
                  <span>⚡ {h.ot_count} OTs available</span>
                </td>
              ))}
            </tr>

            {/* 6. EQUIPMENT */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem', fontWeight: 600 }}>Specialized Equipment</td>
              {hospitals.map(h => {
                const d = getDeptInfo(h, mappedCategory);
                const equip = d ? d.equipment.split(',') : [];
                return (
                  <td key={h.id} style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                      {equip.map((e, idx) => (
                        <span key={idx} style={{
                          backgroundColor: 'var(--bg-blue-gray)',
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px'
                        }}>
                          {e}
                        </span>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* 7. TREATMENT COST */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem', fontWeight: 600 }}>Estimated Treatment Cost</td>
              {hospitals.map(h => {
                const de = getDeptInfo(h, mappedCategory);
                const categoryName = de ? de.name : mappedCategory;
                const cEst = h.cost_estimates.find(c => c.treatment_name.toLowerCase().includes(categoryName.toLowerCase()));
                if (!cEst) return <td key={h.id} style={{ padding: '1rem' }}>N/A</td>;
                
                const avg = (cEst.cost_min + cEst.cost_max) / 2;
                const isBest = avg === minCost;
                
                return (
                  <td key={h.id} style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{
                        fontWeight: isBest ? 'bold' : '600',
                        color: isBest ? 'var(--primary-teal)' : 'inherit'
                      }}>
                        ₹{cEst.cost_min.toLocaleString()} - ₹{cEst.cost_max.toLocaleString()}
                      </span>
                      {isBest && <span style={{ fontSize: '0.65rem', color: 'var(--primary-teal)', fontWeight: 'bold' }}>💸 Lowest Cost</span>}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* 8. ACCREDITATION */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem', fontWeight: 600 }}>Quality Accreditations</td>
              {hospitals.map(h => (
                <td key={h.id} style={{ padding: '1rem' }}>
                  {h.accreditation.split(',').map((acc, i) => (
                    <span key={i} className="badge badge-teal" style={{ marginRight: '0.2rem', fontSize: '0.65rem' }}>
                      {acc}
                    </span>
                  ))}
                </td>
              ))}
            </tr>

            {/* 9. INSURANCE PANELS */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem', fontWeight: 600 }}>Insurance Partners count</td>
              {hospitals.map(h => {
                const count = h.insurance_panels.split(',').length;
                return (
                  <td key={h.id} style={{ padding: '1rem' }}>
                    <span>🛡️ {count} network insurers</span>
                  </td>
                );
              })}
            </tr>

            {/* 10. EMERGENCY STATUS */}
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '1rem', fontWeight: 600 }}>Emergency readiness</td>
              {hospitals.map(h => (
                <td key={h.id} style={{ padding: '1rem' }}>
                  {h.emergency_available ? (
                    <span style={{ color: 'var(--primary-teal)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      <Check size={14} /> Available 24x7
                    </span>
                  ) : (
                    <span style={{ color: 'var(--coral-alert)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.85rem' }}>
                      <X size={14} /> No emergency ICU
                    </span>
                  )}
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>

      {shareLinkCopied && (
        <div style={{
          position: 'fixed',
          top: '90px',
          right: '20px',
          backgroundColor: 'var(--primary-teal)',
          color: 'white',
          padding: '0.8rem 1.2rem',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-md)',
          zIndex: 100
        }}>
          📋 Share URL copied to clipboard! You can send it to your family on WhatsApp.
        </div>
      )}

    </div>
  );
}
