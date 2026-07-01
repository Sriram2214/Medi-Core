import React from 'react';
import { Search, MapPin, Shield, DollarSign, Zap, X, Sparkles, Heart, Activity, Award, ArrowRight } from 'lucide-react';
import InfrastructureSection from '../components/InfrastructureSection';
import { TAMIL_NADU_DISTRICTS } from '../data/districts';
import './Home.css';

const SYMPTOM_CATEGORIES = [
  { label: '🫀 Bypass Surgery / Heart Pain', val: 'dil me dard' },
  { label: '🫘 Kidney Stone Removal (Pathri)', val: 'pathri operation' },
  { label: '🦴 Knee Joint Replacement', val: 'knee replacement' },
  { label: '🎗️ Cancer Chemotherapy', val: 'cancer' },
  { label: '👶 C-Section Delivery', val: 'c-section' },
  { label: '🧠 Neuro / Stroke Care', val: 'stroke' },
  { label: '🩸 Accident & Trauma Care', val: 'accident' }
];

const BUDGET_PRESETS = [
  { label: '< ₹50,000', val: '50000' },
  { label: '< ₹1,00,000', val: '100000' },
  { label: '< ₹3,00,000', val: '300000' },
  { label: '< ₹5,00,000', val: '500000' },
  { label: 'No Budget Limit', val: '' }
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
  onExploreFacilities,
  onOpenRadar
}) {
  return (
    <div className="home-container">
      
      {/* Hero Section */}
      <div className="hero-header">
        <h1 className="hero-title">
          Find the Best Hospital for Your Treatment
        </h1>
        <p className="hero-subtitle">
          MediGuide AI calculates a <strong>Treatment Quality Index (TQI)</strong> to give you objective, explainable, and localized hospital recommendation scores across Tamil Nadu and Metro Cities.
        </p>
      </div>

      {/* AI Hospital Discovery Dashboard (Modal) */}
      {isSearchOpen && (
        <div className="ai-modal-overlay" onClick={() => setIsSearchOpen(false)}>
          <div className="ai-search-dashboard animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button className="ai-modal-close" onClick={() => setIsSearchOpen(false)}>
              <X size={24} />
            </button>
            
            {/* Dashboard Header */}
            <div className="dashboard-header">
              <span className="ai-badge">
                <Sparkles size={14} /> AI-Powered Clinical Matcher
              </span>
              <h2 className="dashboard-title">
                Smart Hospital & Treatment Discovery
              </h2>
              <p className="dashboard-subtitle">
                Enter your symptoms or procedure to get AI-ranked hospitals tailored by quality, proximity, and cost.
              </p>
            </div>
            
            <div className="search-form-section">
              {/* Row 1: Condition & City */}
              <div className="grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="section-label">
                    <Activity size={18} className="icon-teal" /> Medical Condition / Surgery / Symptom
                  </label>
                  <div className="input-with-icon">
                    <Search size={18} className="input-icon-left" />
                    <input
                      type="text"
                      placeholder="e.g. Bypass Surgery, Kidney Stone, Chemotherapy, C-Section..."
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="ai-input-field"
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="section-label">
                    <MapPin size={18} className="icon-blue" /> City / District Selector
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="ai-select-field"
                  >
                    <optgroup label="Tamil Nadu Districts">
                      {TAMIL_NADU_DISTRICTS.map((d, idx) => (
                        <option key={idx} value={d.name}>{d.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Other Metro Cities">
                      <option value="Bangalore">Bangalore</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pune">Pune</option>
                      <option value="Jaipur">Jaipur</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Categorized Symptom Quick-Select Chips */}
              <div className="symptom-chips-container">
                <span className="chips-title">🔥 Popular Clinical Searches & Translations:</span>
                {SYMPTOM_CATEGORIES.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCondition(s.val)}
                    className="symptom-chip"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <hr style={{ border: 'none', borderBottom: '2px solid var(--border-color)', margin: '0.5rem 0' }} />

              {/* Row 2: Priority Sort Cards Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label className="section-label">
                  <Award size={18} className="icon-gold" /> How should AI prioritize recommendations?
                </label>
                <div className="priority-cards-grid">
                  {[
                    { id: 'quality', label: 'Quality (TQI Score)', desc: 'Best clinical outcome & success rate', icon: <Shield size={20} /> },
                    { id: 'affordability', label: 'Affordability (Cost)', desc: 'Lowest procedure cost & discounts', icon: <DollarSign size={20} /> },
                    { id: 'proximity', label: 'Proximity (Distance)', desc: 'Shortest driving time from your city', icon: <MapPin size={20} /> },
                    { id: 'emergency', label: 'Emergency Readiness', desc: '24x7 Trauma care & active ICU beds', icon: <Zap size={20} /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPriority(tab.id)}
                      className={`priority-card ${priority === tab.id ? 'active' : ''}`}
                    >
                      <div className="priority-icon-wrapper">
                        {tab.icon}
                      </div>
                      <span className="priority-label">{tab.label}</span>
                      <span className="priority-desc">{tab.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <hr style={{ border: 'none', borderBottom: '2px solid var(--border-color)', margin: '0.5rem 0' }} />

              {/* Row 3: Insurance & Budget */}
              <div className="grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="section-label">🛡️ Insurance Provider (Optional)</label>
                  <select
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    className="ai-select-field"
                  >
                    <option value="">-- No Insurance (Cash Payment) --</option>
                    <option value="CMCHIS (TN State Govt Insurance)">CMCHIS (TN State Govt Insurance)</option>
                    <option value="Star Health">Star Health</option>
                    <option value="HDFC ERGO">HDFC ERGO</option>
                    <option value="New India Assurance">New India Assurance</option>
                    <option value="ICICI Lombard">ICICI Lombard</option>
                    <option value="Niva Bupa">Niva Bupa</option>
                    <option value="Care Health">Care Health</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label className="section-label">💰 Max Budget Limit (Optional, ₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 300000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="ai-input-field"
                    style={{ paddingLeft: '1.2rem' }}
                  />
                  <div className="budget-presets">
                    {BUDGET_PRESETS.map((bp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBudget(bp.val)}
                        className="budget-chip"
                      >
                        {bp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Discover AI & GPS Radar Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    onOpenRadar && onOpenRadar();
                  }}
                  className="btn-discover-ai"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #10b981)', flex: '1 1 240px' }}
                >
                  📍 Launch GPS Radar (Near Me)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    onSearch();
                  }}
                  className="btn-discover-ai"
                  style={{ flex: '2 1 320px' }}
                >
                  <Sparkles size={22} /> Discover AI-Ranked Hospitals <ArrowRight size={22} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GPS Geo-Spatial Location Radar Banner */}
      <div className="emergency-banner" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '2px solid #0ea5e9', marginBottom: '1.5rem', boxShadow: '0 12px 30px rgba(14, 165, 233, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'rgba(14, 165, 233, 0.25)',
            padding: '1rem',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0ea5e9'
          }} className="pulse">
            <MapPin size={36} />
          </div>
          <div>
            <h3 className="emergency-title" style={{ color: '#ffffff' }}><MapPin size={24} style={{ color: '#0ea5e9' }} /> Geo-Spatial GPS Distance Radar</h3>
            <p style={{ fontSize: '0.95rem', maxWidth: '650px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
              Turn on your device location or select a preset to discover all Hospitals, Medical Stores, Scan Centres, and Diagnostic Labs within your custom radius range (1 km to 50 km).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpenRadar && onOpenRadar()}
          className="btn"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #10b981)',
            color: '#FFFFFF',
            padding: '1.1rem 2.2rem',
            fontWeight: '800',
            fontSize: '1.05rem',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 20px rgba(14, 165, 233, 0.4)',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          📍 Launch GPS Radar ➔
        </button>
      </div>

      {/* Emergency Quick access Banner */}
      <div className="emergency-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.25)',
            padding: '1rem',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EF4444'
          }} className="pulse">
            <Zap size={36} />
          </div>
          <div>
            <h3 className="emergency-title"><Zap size={24} /> Emergency Fast-Track Mode</h3>
            <p style={{ fontSize: '0.95rem', maxWidth: '650px', color: '#FCA5A5', lineHeight: '1.6', margin: 0 }}>
              Are you looking for immediate critical admission? Fast-track bypasses all filters to instantly rank the nearest hospitals with active ICU beds and 24x7 ambulance facilities.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onEmergencyToggle(true)}
          className="btn btn-danger"
          style={{
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            padding: '1.1rem 2.2rem',
            fontWeight: '800',
            fontSize: '1.05rem',
            borderRadius: '16px',
            boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)'
          }}
        >
          Activate Emergency Mode 🚨
        </button>
      </div>
      
      {/* World-Class Infrastructure Section */}
      <InfrastructureSection onExploreFacilities={onExploreFacilities} />
      
    </div>
  );
}
