import React, { useState, useMemo } from 'react';
import schemesData from '../data/schemes.json';
import { Landmark, ShieldCheck, FileText, CheckCircle2, ArrowRight, ExternalLink, X, Filter, Building2, Calendar, HelpCircle, DollarSign, Sparkles } from 'lucide-react';
import './GovernmentSchemes.css';

export default function GovernmentSchemes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(schemesData.map(s => s.Category || 'General Schemes'));
    return ['All', ...Array.from(cats)];
  }, []);

  // Filter schemes based on search and category
  const filteredSchemes = useMemo(() => {
    return schemesData.filter(scheme => {
      const matchesSearch = 
        scheme['Scheme Name'].toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme['What It Covers'].toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme['Eligibility'].toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || scheme.Category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const extractUrl = (scheme) => {
    return scheme.Direct_URL || 'https://www.myscheme.gov.in/';
  };

  return (
    <div className="schemes-page animate-fade-in">
      {/* Hero Section */}
      <section className="schemes-hero">
        <div className="container">
          <div className="hero-content text-center">
            <div className="inline-badge">
              <Sparkles size={16} /> 100+ Central & State Healthcare Initiatives
            </div>
            <h1 className="hero-title text-gradient">Government Health Schemes Directory</h1>
            <p className="hero-subtitle">
              Comprehensive guide to financial aid, insurance coverage, and free medical treatments provided by Tamil Nadu and Central Government.
            </p>
            
            {/* Search Bar */}
            <div className="search-bar-wrapper">
              <input 
                type="text" 
                placeholder="Search by illness, scheme name, or eligibility (e.g., Cancer, CMCHIS, BPL)..." 
                className="schemes-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="category-tabs">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  className={`category-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Schemes Grid */}
      <section className="schemes-container">
        <div className="container">
          <div className="schemes-stats">
            <span>Showing <strong>{filteredSchemes.length}</strong> available schemes</span>
            {selectedCategory !== 'All' && <span className="active-filter-badge">{selectedCategory}</span>}
          </div>

          <div className="schemes-grid">
            {filteredSchemes.map((scheme, idx) => (
              <div key={idx} className="scheme-card glass-panel hover-card">
                <div className="scheme-card-header">
                  <div className="header-top">
                    <span className="scheme-category-tag">{scheme.Category || 'Healthcare'}</span>
                    <span className="scheme-year"><Calendar size={12} /> {scheme['Launched By / Year']}</span>
                  </div>
                  <h3 className="scheme-title">{scheme['Scheme Name']}</h3>
                </div>
                
                <div className="scheme-card-body">
                  <div className="scheme-feature">
                    <DollarSign className="feature-icon benefit-icon" size={20} />
                    <div>
                      <strong>Benefit:</strong> {scheme['Coverage Amount / Benefit'] || 'Free Medical Services'}
                    </div>
                  </div>
                  <div className="scheme-feature">
                    <CheckCircle2 className="feature-icon" size={20} />
                    <div>
                      <strong>Eligibility:</strong> {scheme['Eligibility'] ? (scheme['Eligibility'].length > 80 ? scheme['Eligibility'].substring(0, 80) + '...' : scheme['Eligibility']) : 'All Citizens'}
                    </div>
                  </div>
                  <div className="scheme-feature">
                    <FileText className="feature-icon" size={20} />
                    <div>
                      <strong>Covers:</strong> {scheme['What It Covers'] ? (scheme['What It Covers'].length > 100 ? scheme['What It Covers'].substring(0, 100) + '...' : scheme['What It Covers']) : 'General Healthcare'}
                    </div>
                  </div>
                </div>

                <div className="scheme-card-footer">
                  <button 
                    className="btn btn-secondary view-details-btn"
                    onClick={() => setSelectedScheme(scheme)}
                  >
                    View Complete Details
                  </button>
                  <a 
                    href={extractUrl(scheme)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary apply-btn"
                    style={{ textDecoration: 'none' }}
                  >
                    Apply Now <ExternalLink size={16} style={{marginLeft: '6px'}} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredSchemes.length === 0 && (
            <div className="no-results text-center glass-panel">
              <HelpCircle size={48} className="no-results-icon" />
              <h3>No healthcare schemes found</h3>
              <p>Try adjusting your search terms or switching category tabs above.</p>
              <button className="btn btn-primary" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Detailed Modal Overlay */}
      {selectedScheme && (
        <div className="scheme-modal-overlay" onClick={() => setSelectedScheme(null)}>
          <div className="scheme-modal glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedScheme(null)}>
              <X size={24} />
            </button>

            <div className="modal-header">
              <div className="modal-badge-row">
                <span className="scheme-category-tag">{selectedScheme.Category || 'Government Scheme'}</span>
                <span className="scheme-year"><Building2 size={14} /> {selectedScheme['Launched By / Year']}</span>
              </div>
              <h2 className="modal-title">{selectedScheme['Scheme Name']}</h2>
            </div>

            <div className="modal-body">
              <div className="modal-section highlight-box">
                <h4><DollarSign className="icon-gold" size={20} /> Financial Coverage & Benefit</h4>
                <p>{selectedScheme['Coverage Amount / Benefit'] || 'Not specified'}</p>
              </div>

              <div className="modal-section">
                <h4><CheckCircle2 className="icon-teal" size={20} /> Who Can Apply? (Eligibility Criteria)</h4>
                <p>{selectedScheme['Eligibility'] || 'All eligible citizens as per government norms.'}</p>
              </div>

              <div className="modal-section">
                <h4><FileText className="icon-blue" size={20} /> What Treatments & Procedures Are Covered?</h4>
                <p>{selectedScheme['What It Covers'] || 'Comprehensive healthcare support.'}</p>
              </div>

              <div className="modal-section apply-step-box">
                <h4><ArrowRight className="icon-green" size={20} /> How to Apply & Required Documents</h4>
                <p>{selectedScheme['How to Apply'] || 'Visit the nearest Government Hospital, District Health Office, or Official Online Portal.'}</p>
              </div>

              {selectedScheme['Official Source / Helpline'] && (
                <div className="modal-section helpline-box">
                  <strong>Official Helpline / Reference:</strong> {selectedScheme['Official Source / Helpline']}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedScheme(null)}>
                Close Details
              </button>
              <a 
                href={extractUrl(selectedScheme)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary modal-apply-btn"
                style={{ textDecoration: 'none' }}
              >
                Proceed to Official Application Portal <ExternalLink size={18} style={{marginLeft: '8px'}} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
