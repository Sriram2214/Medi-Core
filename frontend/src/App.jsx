import React, { useState, useEffect } from 'react';
import { ShieldAlert, Sun, Moon, MessageSquare, User, Zap, HelpCircle, Activity, Award, ChevronDown } from 'lucide-react';
import Home from './pages/Home';
import Results from './pages/Results';
import HospitalProfile from './pages/HospitalProfile';
import Compare from './pages/Compare';
import Admin from './pages/Admin';
import Facilities from './pages/Facilities';
import ChatbotPanel from './components/ChatbotPanel';
import FloatingSideNav from './components/FloatingSideNav';
import GovernmentSchemes from './pages/GovernmentSchemes';
import { TAMIL_NADU_DISTRICTS } from './data/districts';

export default function App() {
  // Screen Router
  const [currentScreen, setCurrentScreen] = useState('home'); // home, results, profile, compare, admin

  // Search parameters
  const [condition, setCondition] = useState('');
  const [city, setCity] = useState('Pune');
  const [priority, setPriority] = useState('quality'); // quality, affordability, proximity, emergency
  const [insurance, setInsurance] = useState('');
  const [budget, setBudget] = useState('');

  // Results cache
  const [searchResults, setSearchResults] = useState(null);
  const [mappedCategory, setMappedCategory] = useState('');

  // Profile detail context
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [selectedHospitalName, setSelectedHospitalName] = useState('');

  // Compare Dock cache
  const [compareList, setCompareList] = useState([]);

  // Global settings
  const [darkMode, setDarkMode] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [userRole, setUserRole] = useState('patient'); // patient, admin
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Trigger dark mode CSS class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSpecialtySelect = (specialty) => {
    setCondition(specialty);
    setCurrentScreen('home');
    setTimeout(() => {
      const searchPanel = document.querySelector('.glass-panel');
      if (searchPanel) {
        searchPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const scrollToSection = (selector) => {
    setCurrentScreen('home');
    setTimeout(() => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Handle Search submit
  const handleSearch = async (overrideParams = null) => {
    let cond = condition;
    let ct = city;
    let pri = priority;
    let ins = insurance;
    let bud = budget;

    if (overrideParams) {
      cond = overrideParams.condition !== undefined ? overrideParams.condition : cond;
      ct = overrideParams.city !== undefined ? overrideParams.city : ct;
      pri = overrideParams.priority !== undefined ? overrideParams.priority : pri;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          condition: cond || 'General Medicine',
          city: ct,
          budget: bud ? parseInt(bud) : null,
          insurance_provider: ins || null,
          priority: pri,
          age_group: 'adult'
        })
      });

      if (!response.ok) throw new Error('API server down');
      const data = await response.json();
      
      setSearchResults(data.results);
      setMappedCategory(data.mapped_category);
      setCurrentScreen('results');
    } catch (err) {
      alert('Could not connect to backend server. Please verify backend FastAPI is running at http://127.0.0.1:8000.');
    }
  };

  // Toggle emergency mode
  const handleEmergencyToggle = (enable) => {
    if (enable) {
      setEmergencyMode(true);
      setPriority('emergency');
      setCondition('Emergency trauma care');
      // Bypasses input and searches immediately
      handleSearch({
        condition: 'Emergency trauma care',
        city: city,
        priority: 'emergency'
      });
    } else {
      setEmergencyMode(false);
      setPriority('quality');
      setCondition('');
      setCurrentScreen('home');
    }
  };

  // Toggle item in compare list
  const handleToggleCompare = (hospitalItem) => {
    const exists = compareList.some(item => item.id === hospitalItem.hospital_id);
    if (exists) {
      setCompareList(compareList.filter(item => item.id !== hospitalItem.hospital_id));
    } else {
      if (compareList.length >= 3) {
        alert('You can compare maximum 3 hospitals side-by-side.');
        return;
      }
      setCompareList([...compareList, {
        id: hospitalItem.hospital_id,
        name: hospitalItem.hospital_name
      }]);
    }
  };

  // Chatbot action handlers
  const handleChatActionClick = (actionType, queryText) => {
    if (actionType === 'emergency') {
      handleEmergencyToggle(true);
    } else if (actionType === 'admin') {
      setUserRole('admin');
      setCurrentScreen('admin');
      setChatbotOpen(false);
    } else if (actionType === 'recommend' && queryText) {
      // Parse query e.g. "Recommend for Cardiology in Pune"
      // or "Best Cardiology in Pune"
      const lower = queryText.toLowerCase();
      let detectedCity = 'Pune';
      for (const c of ['chennai', 'hyderabad', 'bangalore', 'pune', 'jaipur']) {
        if (lower.includes(c)) {
          detectedCity = c.charAt(0).toUpperCase() + c.slice(1);
          break;
        }
      }
      let conditionText = 'Cardiology';
      if (lower.includes('urology')) conditionText = 'Urology';
      if (lower.includes('orthopedics')) conditionText = 'Orthopedics';
      
      setCondition(conditionText);
      setCity(detectedCity);
      setPriority('quality');
      
      handleSearch({
        condition: conditionText,
        city: detectedCity,
        priority: 'quality'
      });
    }
  };

  return (
    <div className={`app-container ${emergencyMode ? 'emergency-theme' : ''}`}>
      
      {/* Floating Global Side Nav */}
      <FloatingSideNav
        onSearchClick={() => {
          setCurrentScreen('home');
          setIsSearchOpen(true);
        }}
        onEmergency={() => handleEmergencyToggle(true)}
        onCompare={() => {
          if (compareList.length > 0) setCurrentScreen('compare');
          else alert("Add hospitals to compare first!");
        }}
        onChatbot={() => setChatbotOpen(true)}
        onSchemes={() => setCurrentScreen('schemes')}
      />

      {/* Navbar Header */}
      <header className="navbar">
        {/* Logo and Brand */}
        <div
          onClick={() => {
            if (emergencyMode) handleEmergencyToggle(false);
            else setCurrentScreen('home');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
        >
          <div style={{
            backgroundColor: emergencyMode ? '#EF4444' : 'var(--primary-teal)',
            color: 'white',
            padding: '0.4rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={24} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              MediGuide <span style={{ color: emergencyMode ? '#EF4444' : 'var(--primary-teal-light)' }}>AI</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Decision-Support System
            </span>
          </div>
        </div>

        {/* Dynamic Navigation Dropdown Tabs */}
        <div className="nav-dropdown-tabs">
          
          {/* Find Hospital Mega Menu Tab */}
          <div className="nav-tab-item mega-menu-trigger">
            <span>Find Hospital</span>
            <ChevronDown size={14} style={{ opacity: 0.7 }} />
            
            {/* Mega Menu Panel */}
            <div className="mega-menu-panel">
              <div className="mega-menu-grid">
                {TAMIL_NADU_DISTRICTS.map((district) => (
                  <div key={district.name} className="mega-menu-district">
                    <h4>{district.name}</h4>
                    <ul>
                      {district.hospitals.map((hospital) => (
                        <li key={hospital}>
                          <button onClick={() => {
                             setCondition('General Checkup');
                             setCity(district.name);
                             setCurrentScreen('home');
                             setTimeout(() => {
                               const searchPanel = document.querySelector('.glass-panel');
                               if (searchPanel) searchPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                             }, 100);
                          }}>{hospital}</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="nav-tab-item">
            <span>Specialties</span>
            <ChevronDown size={14} style={{ opacity: 0.7 }} />
            <div className="nav-dropdown-menu">
              <button className="dropdown-item" onClick={() => handleSpecialtySelect('Cardiology')}>Cardiology Care</button>
              <button className="dropdown-item" onClick={() => handleSpecialtySelect('Urology')}>Urology & Stones</button>
              <button className="dropdown-item" onClick={() => handleSpecialtySelect('Orthopedics')}>Orthopedics & Bones</button>
              <button className="dropdown-item" onClick={() => handleSpecialtySelect('Oncology')}>Oncology Center</button>
              <button className="dropdown-item" onClick={() => handleSpecialtySelect('Gynecology')}>Gynecology & Maternity</button>
            </div>
          </div>
          
          <div className="nav-tab-item">
            <span>Patient Care</span>
            <ChevronDown size={14} style={{ opacity: 0.7 }} />
            <div className="nav-dropdown-menu">
              <button className="dropdown-item" onClick={() => setIsSearchOpen(true)}>Search Recommendations</button>
              <button className="dropdown-item" onClick={() => handleEmergencyToggle(true)}>Emergency Admissions</button>
              <button className="dropdown-item" onClick={() => scrollToSection('.stats-container')}>Global Metrics</button>
            </div>
          </div>
        </div>

        {/* Action Header controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {/* User Role selection */}
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
            <button
              onClick={() => {
                setUserRole('patient');
                if (currentScreen === 'admin') setCurrentScreen('home');
              }}
              style={{
                padding: '0.4rem 0.8rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: userRole === 'patient' ? 'var(--primary-teal-alpha)' : 'var(--white)',
                color: userRole === 'patient' ? 'var(--primary-teal)' : 'var(--text-muted)'
              }}
            >
              Patient
            </button>
            <button
              onClick={() => {
                setUserRole('admin');
                setCurrentScreen('admin');
              }}
              style={{
                padding: '0.4rem 0.8rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: userRole === 'admin' ? 'var(--primary-teal-alpha)' : 'var(--white)',
                color: userRole === 'admin' ? 'var(--primary-teal)' : 'var(--text-muted)'
              }}
            >
              Admin Dashboard
            </button>
          </div>

          {/* Emergency mode badge trigger */}
          <button
            onClick={() => handleEmergencyToggle(!emergencyMode)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              backgroundColor: emergencyMode ? '#EF4444' : 'rgba(239, 68, 68, 0.1)',
              color: emergencyMode ? 'white' : '#EF4444'
            }}
          >
            <Zap size={14} /> {emergencyMode ? 'Emergency Active' : 'Emergency Mode'}
          </button>

          {/* Dark Mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'inline-flex'
            }}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Chatbot trigger */}
          <button
            onClick={() => setChatbotOpen(!chatbotOpen)}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: chatbotOpen ? 'var(--primary-teal)' : 'var(--text-muted)',
              position: 'relative',
              display: 'inline-flex'
            }}
          >
            <MessageSquare size={20} />
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--coral-alert)'
            }}></span>
          </button>

        </div>
      </header>

      {/* Main Pages router */}
      <main className="main-content">
        {currentScreen === 'home' && (
          <Home
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            condition={condition}
            setCondition={setCondition}
            city={city}
            setCity={setCity}
            priority={priority}
            setPriority={setPriority}
            insurance={insurance}
            setInsurance={setInsurance}
            budget={budget}
            setBudget={setBudget}
            onSearch={() => handleSearch()}
            onEmergencyToggle={handleEmergencyToggle}
            onExploreFacilities={() => setCurrentScreen('facilities')}
          />
        )}

        {currentScreen === 'results' && (
          <Results
            results={searchResults}
            mappedCategory={mappedCategory}
            onHospitalClick={(id) => {
              const h = searchResults.find(r => r.hospital_id === id);
              setSelectedHospitalId(id);
              setSelectedHospitalName(h ? h.hospital_name : '');
              setCurrentScreen('profile');
            }}
            onBack={() => {
              if (emergencyMode) handleEmergencyToggle(false);
              else setCurrentScreen('home');
            }}
            compareList={compareList}
            onToggleCompare={handleToggleCompare}
            onCompareSubmit={() => setCurrentScreen('compare')}
          />
        )}

        {currentScreen === 'profile' && selectedHospitalId && (
          <HospitalProfile
            hospitalId={selectedHospitalId}
            onBack={() => setCurrentScreen('results')}
          />
        )}

        {currentScreen === 'compare' && (
          <Compare
            compareIds={compareList.map(item => item.id)}
            mappedCategory={mappedCategory}
            onBack={() => setCurrentScreen('results')}
            onRemove={(hosp) => {
              const newList = compareList.filter(item => item.id !== hosp.id);
              setCompareList(newList);
              if (newList.length === 0) setCurrentScreen('results');
            }}
          />
        )}

        {currentScreen === 'admin' && (
          <Admin />
        )}

        {currentScreen === 'facilities' && (
          <Facilities />
        )}

        {currentScreen === 'schemes' && (
          <GovernmentSchemes />
        )}
      </main>

      {/* WCAG AA Compliance footer disclaimer */}
      <footer style={{
        marginTop: 'auto',
        padding: '2rem',
        backgroundColor: 'var(--white)',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p>© {new Date().getFullYear()} MediGuide AI. Platform metrics are calculations based on structured clinical capacity and public feedback metrics.</p>
          <p style={{ fontStyle: 'italic' }}>⚠️ Accessibility Statement: This decision support application follows WCAG 2.1 AA design systems with custom contrast controls. Disclaimers: Estimates are not medical advice. Always consult a physician for clinical diagnoses.</p>
        </div>
      </footer>

      {/* Floating Chatbot Drawer */}
      <ChatbotPanel
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        selectedHospitalId={selectedHospitalId}
        selectedHospitalName={selectedHospitalName}
        onActionClick={handleChatActionClick}
      />

    </div>
  );
}
