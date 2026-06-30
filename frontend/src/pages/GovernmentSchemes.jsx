import React, { useState } from 'react';
import schemesData from '../data/schemes.json';
import { Landmark, ShieldCheck, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import './GovernmentSchemes.css';

export default function GovernmentSchemes() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSchemes = schemesData.filter(scheme =>
    scheme['Scheme Name'].toLowerCase().includes(searchTerm.toLowerCase()) ||
    scheme['What It Covers'].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const extractUrl = (scheme) => {
    const text = scheme['Official Source / Helpline'];
    if (!text) return `https://www.google.com/search?q=${encodeURIComponent(scheme['Scheme Name'] + ' official application website')}`;
    
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/i;
    const match = text.match(urlRegex);
    if (match) {
      let url = match[0];
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      return url;
    }
    return `https://www.google.com/search?q=${encodeURIComponent(scheme['Scheme Name'] + ' ' + text + ' official application website')}`;
  };

  return (
    <div className="schemes-page animate-fade-in">
      {/* Hero Section */}
      <section className="schemes-hero">
        <div className="container">
          <div className="hero-content text-center">
            <h1 className="hero-title text-gradient">Government Health Schemes</h1>
            <p className="hero-subtitle">
              Explore healthcare initiatives by the Central and State Governments to make medical treatments affordable and accessible for all.
            </p>
            <div className="search-bar-wrapper">
              <input 
                type="text" 
                placeholder="Search schemes by name or coverage..." 
                className="schemes-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Schemes Grid */}
      <section className="schemes-container">
        <div className="container">
          <div className="schemes-grid">
            {filteredSchemes.map((scheme, idx) => (
              <div key={idx} className="scheme-card glass-panel hover-card">
                <div className="scheme-card-header">
                  <div className="scheme-icon-wrapper">
                    <Landmark className="scheme-icon" size={24} />
                  </div>
                  <h3 className="scheme-title">{scheme['Scheme Name']}</h3>
                  <span className="scheme-badge">{scheme['Launched By / Year']}</span>
                </div>
                
                <div className="scheme-card-body">
                  <div className="scheme-feature">
                    <ShieldCheck className="feature-icon" size={20} />
                    <div>
                      <strong>Coverage:</strong> {scheme['Coverage Amount / Benefit']}
                    </div>
                  </div>
                  <div className="scheme-feature">
                    <CheckCircle2 className="feature-icon" size={20} />
                    <div>
                      <strong>Eligibility:</strong> {scheme['Eligibility']}
                    </div>
                  </div>
                  <div className="scheme-feature">
                    <FileText className="feature-icon" size={20} />
                    <div>
                      <strong>Details:</strong> {scheme['What It Covers']}
                    </div>
                  </div>
                </div>

                <div className="scheme-card-footer">
                  <div className="apply-info">
                    <strong>How to Apply:</strong> {scheme['How to Apply']}
                  </div>
                  <a 
                    href={extractUrl(scheme)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary apply-btn"
                    style={{ textDecoration: 'none' }}
                  >
                    Official Source <ArrowRight size={16} style={{marginLeft: '8px'}} />
                  </a>
                </div>
              </div>
            ))}
          </div>
          {filteredSchemes.length === 0 && (
            <div className="no-results text-center">
              <h3>No schemes found matching your search.</h3>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
