import React, { useState } from 'react';
import { Shield, Users, Activity, Heart, Stethoscope, Building2, MapPin, Award, CheckCircle, ExternalLink, Filter, Search } from 'lucide-react';
import { TAMIL_NADU_DISTRICTS } from '../data/districts';
import './Facilities.css';

export default function Facilities() {
  const [selectedDistrict, setSelectedDistrict] = useState('Perambalur');
  const [activeCategory, setActiveCategory] = useState('hospitals'); // hospitals, scanCentres, labs, pharmacies

  // Find district data
  const currentDistrictData = TAMIL_NADU_DISTRICTS.find(d => d.name === selectedDistrict) || TAMIL_NADU_DISTRICTS[0];
  const facilitiesData = currentDistrictData.facilities || {
    hospitals: (currentDistrictData.hospitals || []).map(h => ({ name: h, website: null, type: 'Private / Govt' })),
    scanCentres: [],
    labs: [],
    pharmacies: []
  };

  const getActiveList = () => {
    switch (activeCategory) {
      case 'hospitals': return facilitiesData.hospitals || [];
      case 'scanCentres': return facilitiesData.scanCentres || [];
      case 'labs': return facilitiesData.labs || [];
      case 'pharmacies': return facilitiesData.pharmacies || [];
      default: return [];
    }
  };

  const activeList = getActiveList();

  const hospitals = [
    { 
      name: 'All India Institute of Medical Sciences (AIIMS)', 
      loc: 'New Delhi',
      img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
      desc: "India's premier medical institute offering cutting-edge healthcare, research, and education. Known globally for its highly specialized doctors, advanced treatments, and being the ultimate destination for complex medical cases in the country."
    },
    { 
      name: 'Apollo Hospitals', 
      loc: 'Chennai',
      img: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80',
      desc: "A pioneer in private healthcare in India, Apollo Chennai is renowned for its state-of-the-art facilities, especially in cardiology, oncology, and complex organ transplants. It revolutionized corporate healthcare in the nation."
    },
    { 
      name: 'Fortis Healthcare', 
      loc: 'Gurugram',
      img: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80',
      desc: "A world-class facility providing comprehensive medical care with advanced technology and a patient-centric approach. Fortis Gurugram stands out for its centers of excellence in neurosciences and cardiac sciences."
    },
    { 
      name: 'Medanta - The Medicity', 
      loc: 'Gurugram',
      img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80',
      desc: "Founded by the legendary Dr. Naresh Trehan, Medanta is a massive multi-super-specialty institute known for delivering world-class treatments, particularly in cardiology, neurology, and gastroenterology."
    },
    { 
      name: 'Kokilaben Dhirubhai Ambani Hospital', 
      loc: 'Mumbai',
      img: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=800&q=80',
      desc: "One of Mumbai's most advanced quaternary care hospitals, equipped with the latest robotic surgery systems, comprehensive cancer care, and a highly praised full-time specialist system."
    },
    { 
      name: 'Christian Medical College (CMC)', 
      loc: 'Vellore',
      img: 'https://images.unsplash.com/photo-1587370560942-ad2a04eabb6d?w=800&q=80',
      desc: "A historic and highly respected institution delivering top-tier medical care with a strong focus on community health, research, and ethics. CMC Vellore is highly sought after for rare diseases and bone marrow transplants."
    },
    { 
      name: 'Manipal Hospitals', 
      loc: 'Bengaluru',
      img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80',
      desc: "A leading healthcare provider in South India, known for its multidisciplinary approach and excellence in complex surgeries, pediatrics, and oncology, offering care that meets global standards."
    },
    { 
      name: 'MAX Healthcare', 
      loc: 'New Delhi',
      img: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=800&q=80',
      desc: "Offering premier healthcare services across multiple specialties, MAX is recognized for its top-notch infrastructure, expert specialists, and dedicated institutes for heart, cancer, and neurosciences."
    },
    { 
      name: 'Narayana Health', 
      loc: 'Bengaluru',
      img: 'https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?w=800&q=80',
      desc: "Founded by Dr. Devi Shetty, it is globally renowned for making high-quality heart surgeries and other critical care accessible and affordable to the masses without compromising on world-class outcomes."
    }
  ];

  const doctors = [
    { name: 'Dr. Rajesh Sharma', spec: 'Cardiologist', img: 'https://ui-avatars.com/api/?name=Rajesh+Sharma&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Priya Nair', spec: 'Neurologist', img: 'https://ui-avatars.com/api/?name=Priya+Nair&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Arvind Menon', spec: 'Orthopedic Surgeon', img: 'https://ui-avatars.com/api/?name=Arvind+Menon&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Sneha Iyer', spec: 'Gynecologist', img: 'https://ui-avatars.com/api/?name=Sneha+Iyer&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Vikram Reddy', spec: 'Gastroenterologist', img: 'https://ui-avatars.com/api/?name=Vikram+Reddy&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Ananya Patel', spec: 'Dermatologist', img: 'https://ui-avatars.com/api/?name=Ananya+Patel&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Amit Gupta', spec: 'Pediatrician', img: 'https://ui-avatars.com/api/?name=Amit+Gupta&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Meera Krishnan', spec: 'Endocrinologist', img: 'https://ui-avatars.com/api/?name=Meera+Krishnan&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Sandeep Raut', spec: 'General Surgeon', img: 'https://ui-avatars.com/api/?name=Sandeep+Raut&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Nikhil Verma', spec: 'Nephrologist', img: 'https://ui-avatars.com/api/?name=Nikhil+Verma&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Karthik Subramanian', spec: 'Ophthalmologist', img: 'https://ui-avatars.com/api/?name=Karthik+Subramanian&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Pooja Singh', spec: 'ENT Specialist', img: 'https://ui-avatars.com/api/?name=Pooja+Singh&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Harish Bhatt', spec: 'Oncologist', img: 'https://ui-avatars.com/api/?name=Harish+Bhatt&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Leena Fernandes', spec: 'Psychiatrist', img: 'https://ui-avatars.com/api/?name=Leena+Fernandes&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Aditya Malhotra', spec: 'Pulmonologist', img: 'https://ui-avatars.com/api/?name=Aditya+Malhotra&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Kavya Reddy', spec: 'Rheumatologist', img: 'https://ui-avatars.com/api/?name=Kavya+Reddy&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Manish Bansal', spec: 'Urologist', img: 'https://ui-avatars.com/api/?name=Manish+Bansal&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Shalini Das', spec: 'Radiologist', img: 'https://ui-avatars.com/api/?name=Shalini+Das&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Gaurav Joshi', spec: 'Hematologist', img: 'https://ui-avatars.com/api/?name=Gaurav+Joshi&background=0D8ABC&color=fff&size=150' },
    { name: 'Dr. Ritu Kapoor', spec: 'Plastic Surgeon', img: 'https://ui-avatars.com/api/?name=Ritu+Kapoor&background=0D8ABC&color=fff&size=150' }
  ];

  const marqueeContent = [...doctors, ...doctors]; // Duplicate for seamless looping

  return (
    <div className="facilities-container">
      
      {/* Top Section: Explanation & Doctors Marquee */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-container {
            overflow: hidden;
            white-space: nowrap;
            width: 100%;
            position: relative;
            padding: 1rem 0;
          }
          .marquee-content {
            display: inline-flex;
            gap: 2.5rem;
            animation: marquee 35s linear infinite;
          }
          .marquee-container:hover .marquee-content {
            animation-play-state: paused;
          }
          .doctor-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.8rem;
            background: var(--white);
            padding: 1.2rem;
            border-radius: 20px;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            transition: transform 0.3s ease;
            width: 200px;
            white-space: normal;
          }
          .doctor-card:hover {
            transform: translateY(-5px);
            border-color: var(--primary-teal);
          }
        `}</style>

        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '850px', margin: '0 auto', boxShadow: 'var(--shadow-md)' }}>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--text-dark)', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>
            Empowering Tamil Nadu with Verified Healthcare Facilities
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
            Explore our comprehensive district-wise network of hospitals, scan centres, diagnostic laboratories, and pharmacies. Every healthcare provider is indexed to ensure you get immediate access to critical care, specialized treatments, and essential medical supplies.
          </p>
        </div>

        {/* Endless Doctor Avatar Marquee */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.95rem' }}>
            <Users size={18} style={{ color: 'var(--primary-teal)' }} /> Our Network Features Over 500+ Top Specialists across South India
          </div>
          
          <div className="marquee-container">
            <div className="marquee-content">
              {marqueeContent.map((doc, idx) => (
                <div key={idx} className="doctor-card">
                  <div style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    backgroundImage: `url(${doc.img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    border: '3px solid var(--white)'
                  }}></div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <span style={{ fontWeight: '800', color: 'var(--text-dark)', fontSize: '1rem' }}>{doc.name}</span>
                    <span style={{ color: 'var(--primary-teal)', fontSize: '0.82rem', fontWeight: '700', marginTop: '0.2rem' }}>{doc.spec}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEW: District-Wise Healthcare Directory Section */}
      <section className="district-directory-section">
        <div className="directory-header">
          <div className="directory-title-area">
            <h2 className="directory-title">
              <Building2 size={28} style={{ color: 'var(--primary-teal)' }} /> District Healthcare Directory
            </h2>
            <p className="directory-subtitle">
              Browse hospitals, scan centres, pathology labs, and medical stores across Tamil Nadu districts.
            </p>
          </div>
          
          <div className="district-selector-wrapper">
            <MapPin size={20} style={{ color: 'var(--primary-teal)' }} />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="district-select-input"
            >
              {TAMIL_NADU_DISTRICTS.map((d, idx) => (
                <option key={idx} value={d.name}>{d.name} District</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="facility-category-tabs">
          <button
            type="button"
            onClick={() => setActiveCategory('hospitals')}
            className={`category-tab-btn ${activeCategory === 'hospitals' ? 'active' : ''}`}
          >
            🏥 Hospitals ({facilitiesData.hospitals?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('scanCentres')}
            className={`category-tab-btn ${activeCategory === 'scanCentres' ? 'active' : ''}`}
          >
            🔬 Scan Centres ({facilitiesData.scanCentres?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('labs')}
            className={`category-tab-btn ${activeCategory === 'labs' ? 'active' : ''}`}
          >
            🧪 Diagnostic Labs ({facilitiesData.labs?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('pharmacies')}
            className={`category-tab-btn ${activeCategory === 'pharmacies' ? 'active' : ''}`}
          >
            💊 Pharmacies ({facilitiesData.pharmacies?.length || 0})
          </button>
        </div>

        {/* Facilities Grid */}
        {activeList.length > 0 ? (
          <div className="facilities-grid">
            {activeList.map((fac, idx) => (
              <div key={idx} className="facility-card animate-fadeIn">
                <div className="facility-top">
                  <h3 className="facility-name">{fac.name}</h3>
                  {fac.type && (
                    <span className={`facility-type-badge ${fac.type === 'Govt' ? 'badge-govt' : 'badge-private'}`}>
                      {fac.type}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: '600' }}>
                  <MapPin size={16} style={{ color: 'var(--primary-teal)' }} /> {selectedDistrict}, Tamil Nadu
                </div>

                <div className="facility-footer">
                  {fac.website ? (
                    <a
                      href={fac.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-visit-website"
                    >
                      🌐 Visit Official Website <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className="facility-status-text">
                      ℹ️ Official website not publicly listed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-directory-note">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'inherit' }}>
              Detailed {activeCategory} list for {selectedDistrict} will be available soon!
            </h3>
            <p style={{ margin: 0, opacity: 0.8 }}>
              We are continuously verifying and indexing healthcare centers district by district across Tamil Nadu.
            </p>
          </div>
        )}
      </section>

      {/* Hospitals Section with Details and Images */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <div style={{ height: '2px', background: 'var(--primary-teal)', width: '60px' }}></div>
          <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '1px' }}>Top Quaternary Medical Institutes in India</h2>
          <div style={{ height: '2px', background: 'var(--primary-teal)', width: '60px' }}></div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', perspective: '1200px' }}>
          {hospitals.map((hosp, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={idx} className="glass-panel" style={{ 
                display: 'flex', 
                flexDirection: window.innerWidth > 768 ? (isEven ? 'row' : 'row-reverse') : 'column',
                overflow: 'hidden',
                transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease-out', 
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                transformStyle: 'preserve-3d',
                boxShadow: 'var(--shadow-md)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = `scale(1.04) ${isEven ? 'rotateY(4deg)' : 'rotateY(-4deg)'} translateZ(20px)`;
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(20, 184, 166, 0.35), 0 0 25px rgba(20, 184, 166, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotateY(0deg) translateZ(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}>
                <div style={{ flex: '0 0 400px', height: '280px' }}>
                  <img 
                    src={hosp.img} 
                    alt={hosp.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
                
                <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                  <h3 style={{ fontSize: '1.8rem', marginBottom: '0.8rem', color: 'var(--text-dark)', fontWeight: '800' }}>
                    {hosp.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary-teal)', fontWeight: 'bold', marginBottom: '1.2rem', fontSize: '1.15rem' }}>
                    <MapPin size={22} /> {hosp.loc}
                  </div>
                  <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                    {hosp.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
