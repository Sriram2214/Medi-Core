import React from 'react';
import { Search, MapPin, Shield, DollarSign, Zap, X } from 'lucide-react';
import InfrastructureSection from '../components/InfrastructureSection';


const SUGGESTIONS = [
  { label: 'Dil me dard (Heart Pain)', val: 'dil me dard' },
  { label: 'Kidney Stone (Pathri)', val: 'pathri operation' },
  { label: 'Knee Joint Replacement', val: 'knee replacement' },
  { label: 'Cancer Chemotherapy', val: 'cancer' },
  { label: 'C-Section Delivery', val: 'c-section' }
];

export default function Home({
  isSearchOpen,
  setIsSearchOpen,
  condition,
  setCondition,
  city,
  setCity,
  priority,
  setPriority,
  insurance,
  setInsurance,
  budget,
  setBudget,
  onSearch,
  onEmergencyToggle,
  onExploreFacilities
}) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '2.5rem',
      backgroundImage: "url('/medicore-banner.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      padding: '2rem 1rem',
      margin: '-2rem' // To negate parent padding if any and stretch full width
    }}>
      
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
        <h1 style={{
          fontSize: '3rem',
          lineHeight: '1.2',
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, var(--primary-teal) 0%, var(--primary-teal-light) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          Find the Best Hospital for Your Treatment
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-muted)',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          MediGuide AI calculates a **Treatment Quality Index (TQI)** to give you objective, explainable, and localized hospital recommendation scores.
        </p>
      </div>

      {/* Main Search Panel - Now a Modal */}
      {isSearchOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ 
            padding: '2rem', 
            boxShadow: 'var(--shadow-lg)', 
            maxWidth: '800px', 
            width: '100%',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button 
              onClick={() => setIsSearchOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search style={{ color: 'var(--primary-teal)' }} /> Search hospital database
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Row 1: Condition & City */}
              <div className="grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Medical Condition / Symptom</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Enter disease, surgery or symptom (e.g. bypass, pathri, knee)..."
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>City Selector</label>
                  <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        fontSize: '1rem',
                        outline: 'none',
                        backgroundColor: 'var(--white)',
                        color: 'var(--text-dark)'
                      }}
                    >
                      <option value="Pune">Pune</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Jaipur">Jaipur</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Condition Suggestions Translation Translator */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Try Hindi or English translations:</span>
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCondition(s.val)}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '999px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--white)',
                      color: 'var(--primary-teal)',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                    className="hover-action-btn"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <hr style={{ border: 'none', borderBottom: '1px solid var(--border-color)' }} />

              {/* Row 2: Priority Toggle Tabs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sort Recommendations By</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem',
                  backgroundColor: 'var(--bg-blue-gray)',
                  padding: '0.4rem',
                  borderRadius: '10px'
                }}>
                  {[
                    { id: 'quality', label: 'Quality (TQI Score)', icon: <Shield size={16} /> },
                    { id: 'affordability', label: 'Affordability (Cost)', icon: <DollarSign size={16} /> },
                    { id: 'proximity', label: 'Proximity (Distance)', icon: <MapPin size={16} /> },
                    { id: 'emergency', label: 'Emergency Readiness', icon: <Zap size={16} /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setPriority(tab.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        padding: '0.6rem',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        transition: 'var(--transition)',
                        backgroundColor: priority === tab.id ? 'var(--white)' : 'transparent',
                        color: priority === tab.id ? 'var(--primary-teal)' : 'var(--text-muted)',
                        boxShadow: priority === tab.id ? 'var(--shadow-sm)' : 'none'
                      }}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Optional parameters (Insurance & Budget) */}
              <div className="grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Insurance Provider (Optional)</label>
                  <select
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontSize: '1rem',
                      backgroundColor: 'var(--white)',
                      color: 'var(--text-dark)',
                      outline: 'none'
                    }}
                  >
                    <option value="">-- No Insurance (Cash Payment) --</option>
                    <option value="Star Health">Star Health</option>
                    <option value="HDFC ERGO">HDFC ERGO</option>
                    <option value="New India Assurance">New India Assurance</option>
                    <option value="ICICI Lombard">ICICI Lombard</option>
                    <option value="Niva Bupa">Niva Bupa</option>
                    <option value="Care Health">Care Health</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Max Budget Limit (Optional, ₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 300000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  onSearch();
                }}
                className="btn btn-primary"
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  marginTop: '0.5rem'
                }}
              >
                <Search size={20} /> discover hospital recommendations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Removed the inline image as it is now the background */}

      {/* Emergency Quick access Banner */}
      <div style={{
        backgroundColor: '#7F1D1D',
        color: '#FCA3A3',
        border: '2px solid #EF4444',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            padding: '0.8rem',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EF4444'
          }} className="pulse">
            <Zap size={32} />
          </div>
          <div>
            <h3 style={{ color: '#FEE2E2', fontSize: '1.3rem', fontWeight: 'bold' }}>Emergency Fast-Track Mode</h3>
            <p style={{ fontSize: '0.9rem', maxWidth: '600px', color: '#FCA5A5' }}>
              Are you looking for immediate critical admission? Fast-track bypasses all filters to instantly rank the nearest hospitals with active ICU beds and 24x7 ambulance facilities.
            </p>
          </div>
        </div>
        <button
          onClick={() => onEmergencyToggle(true)}
          className="btn btn-danger"
          style={{
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            padding: '1rem 2rem',
            fontWeight: 'bold',
            fontSize: '1rem',
            borderRadius: '8px'
          }}
        >
          Activate Emergency Mode
        </button>
      </div>
      
      {/* World-Class Infrastructure Section */}
      <InfrastructureSection onExploreFacilities={onExploreFacilities} />
      
    </div>
  );
}
