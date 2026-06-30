import React, { useState, useEffect, useRef } from 'react';
import { Bed, Activity, Scan, ShieldAlert, Cpu, FlaskConical, Sparkles } from 'lucide-react';
import './InfrastructureSection.css';

// Animated Counter Sub-component using IntersectionObserver
const AnimatedCounter = ({ targetValue, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Extract numbers from targetValue (e.g. "13,000" -> 13000)
    const cleanNumber = targetValue.replace(/,/g, '');
    const end = parseInt(cleanNumber, 10);
    if (isNaN(end)) return;

    const totalSteps = 60;
    const stepTime = Math.max(duration / totalSteps, 15);
    
    // Custom easing function for smooth slowing down at the end
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      // Ease out quad formula: f(t) = t * (2 - t)
      const easeOutProgress = progress * (2 - progress);
      const currentCount = Math.floor(easeOutProgress * end);

      if (step >= totalSteps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(currentCount);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isVisible, targetValue, duration]);

  return (
    <span ref={elementRef} className="stat-number">
      {count.toLocaleString()}+
    </span>
  );
};

const CATEGORIES = [
  { id: 'all', label: 'All Facilities' },
  { id: 'critical', label: 'Critical & Emergency' },
  { id: 'diagnostics', label: 'Diagnostics & Labs' },
  { id: 'patient', label: 'Patient Experience' }
];

const INFRA_CARDS = [
  {
    title: 'Smart Patient Rooms',
    desc: 'Luxury private rooms with smart beds, digital nurse calling, automated lighting, entertainment system, and patient monitoring.',
    icon: Bed,
    img: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    category: 'patient',
    originalIndex: 0
  },
  {
    title: 'Advanced Operation Theatres',
    desc: 'State-of-the-art modular operating rooms equipped with robotic surgery systems, AI-assisted surgical tools, laminar airflow, and integrated imaging technology.',
    icon: Activity,
    img: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=800&q=80',
    category: 'critical',
    originalIndex: 1
  },
  {
    title: 'Intelligent ICU',
    desc: 'Fully digital intensive care units featuring real-time monitoring, life-support systems, infection control, and centralized patient management.',
    icon: Activity,
    img: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=800&q=80',
    category: 'critical',
    originalIndex: 2
  },
  {
    title: 'Advanced Diagnostic Center',
    desc: 'MRI, CT Scan, PET Scan, Ultrasound, Digital X-Ray, and AI-powered diagnostic imaging with fast reporting.',
    icon: Scan,
    img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80',
    category: 'diagnostics',
    originalIndex: 3
  },
  {
    title: 'Emergency & Trauma Center',
    desc: '24×7 emergency care with ambulance connectivity, trauma bays, resuscitation rooms, rapid response units, and emergency surgery facilities.',
    icon: ShieldAlert,
    img: 'https://images.unsplash.com/photo-1587350859728-1115984a1c0c?auto=format&fit=crop&w=800&q=80',
    category: 'critical',
    originalIndex: 4
  },
  {
    title: 'Robotic Surgery Center',
    desc: 'Dedicated robotic-assisted surgical suites providing minimally invasive procedures with high precision and faster recovery.',
    icon: Cpu,
    img: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=800&q=80',
    category: 'critical',
    originalIndex: 5
  },
  {
    title: 'Modern Laboratory',
    desc: 'Fully automated pathology, microbiology, hematology, molecular diagnostics, and clinical laboratory with AI-enabled reporting.',
    icon: FlaskConical,
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    category: 'diagnostics',
    originalIndex: 6
  },
  {
    title: 'Healing Environment',
    desc: 'Luxury reception, spacious waiting lounges, indoor greenery, natural lighting, digital information displays, cafeteria, pharmacy, and patient-friendly architecture.',
    icon: Sparkles,
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    category: 'patient',
    originalIndex: 7
  }
];

const STATISTICS = [
  { label: 'Hospitals', value: '75' },
  { label: 'Doctors', value: '13,000' },
  { label: 'Beds', value: '10,000' },
  { label: 'Diagnostic Centers', value: '2,700' },
  { label: 'Pharmacies', value: '7,300' }
];

export default function InfrastructureSection({ onExploreFacilities }) {
  const [revealedCards, setRevealedCards] = useState(new Set());
  const [headerRevealed, setHeaderRevealed] = useState(false);
  const [statsRevealed, setStatsRevealed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const headerRef = useRef(null);
  const cardsRef = useRef([]);
  const statsRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === headerRef.current) {
            setHeaderRevealed(true);
            observer.unobserve(entry.target);
          } else if (entry.target === statsRef.current) {
            setStatsRevealed(true);
            observer.unobserve(entry.target);
          } else {
            const index = entry.target.getAttribute('data-index');
            setRevealedCards((prev) => {
              const next = new Set(prev);
              next.add(index);
              return next;
            });
            observer.unobserve(entry.target);
          }
        }
      });
    }, observerOptions);

    if (headerRef.current) observer.observe(headerRef.current);
    if (statsRef.current) observer.observe(statsRef.current);
    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const handleBookAppointment = () => {
    // Smooth scroll to the main search panel or contact panel
    const searchPanel = document.querySelector('.glass-panel');
    if (searchPanel) {
      searchPanel.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="infra-section-container">
      {/* Title Header */}
      <div 
        ref={headerRef} 
        className={`infra-header fade-up-scroll ${headerRevealed ? 'is-visible' : ''}`}
      >
        <h2 className="infra-title">World-Class Infrastructure</h2>
        <p className="infra-subtitle">
          Experience healthcare powered by advanced technology, intelligent facilities, and patient-centered architecture designed for comfort, safety, and excellence.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="infra-filter-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`infra-filter-tab ${activeCategory === cat.id ? 'active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Cards */}
      <div className="infra-grid">
        {INFRA_CARDS.filter(card => activeCategory === 'all' || card.category === activeCategory).map((card) => {
          const IconComp = card.icon;
          const isVisible = revealedCards.has(String(card.originalIndex)) || activeCategory !== 'all';
          return (
            <div
              key={card.title}
              ref={(el) => (cardsRef.current[card.originalIndex] = el)}
              data-index={card.originalIndex}
              className={`infra-card fade-up-scroll ${isVisible ? 'is-visible' : ''}`}
              style={{ transitionDelay: `${(card.originalIndex % 4) * 0.15}s` }}
            >
              {/* Image & Icon Overlay */}
              <div className="infra-card-image-wrapper">
                <img 
                  src={card.img} 
                  alt={card.title} 
                  className="infra-card-image"
                  loading="lazy" 
                />
                <div className="infra-card-overlay" />
                <div className="infra-icon-badge">
                  <IconComp size={24} />
                </div>
              </div>

              {/* Card Text Content */}
              <div className="infra-card-body">
                <h3 className="infra-card-title">{card.title}</h3>
                <p className="infra-card-desc">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics Section */}
      <div className="stats-section-wrapper">
        <div 
          ref={statsRef}
          className={`stats-container fade-up-scroll ${statsRevealed ? 'is-visible' : ''}`}
        >
          {STATISTICS.map((stat, idx) => (
            <div key={idx} className="stat-item">
              <AnimatedCounter targetValue={stat.value} />
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cinematic Banner */}
      <div className="cinematic-banner">
        <img 
          src="/hospital_golden_hour.png" 
          alt="Modern Hospital Golden Hour Architecture" 
          className="cinematic-banner-bg" 
        />
        <div className="cinematic-banner-overlay" />
        <div className="cinematic-banner-content">
          <h2 className="cinematic-banner-title">Building the Future of Healthcare</h2>
          <p className="cinematic-banner-subtext">
            Combining innovation, compassion, advanced infrastructure, and world-class medical excellence to deliver exceptional patient care.
          </p>
          <div className="cinematic-banner-buttons">
            <button 
              onClick={onExploreFacilities}
              className="btn btn-banner-primary"
            >
              Explore Facilities
            </button>
            <button 
              onClick={handleBookAppointment}
              className="btn btn-banner-secondary"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
