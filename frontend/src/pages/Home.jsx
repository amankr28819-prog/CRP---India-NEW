import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Truck,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Droplet,
  Trash2,
  Lightbulb,
  Dam,
  Trees,
  HelpCircle,
  ArrowRight,
  ArrowDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import heroBg from '../assets/hero-bg.png';
import crpLogo from '../assets/crp-logo-transparent.png';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest('.category-card')) {
        setActiveCategory(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleCategoryClick = (e, slug) => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch && activeCategory !== slug) {
      e.preventDefault();
      setActiveCategory(slug);
      return;
    }
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login', {
        state: {
          from: `/report/${slug}`,
          message: 'Please log in or register to report a civic issue.'
        }
      });
      return;
    }
    navigate(`/report/${slug}`);
  };

  const categories = [
    {
      name: 'Roads & Potholes',
      slug: 'roads-potholes',
      icon: AlertTriangle,
      dept: 'Public Works Department',
      desc: 'Potholes, broken roads, damaged pavements, and missing manhole covers.'
    },
    {
      name: 'Garbage & Sanitation',
      slug: 'garbage-sanitation',
      icon: Trash2,
      dept: 'Solid Waste Management',
      desc: 'Overflowing dumpsters, uncollected trash, and dirty streets.'
    },
    {
      name: 'Streetlights',
      slug: 'streetlights',
      icon: Lightbulb,
      dept: 'Electrical Division',
      desc: 'Broken streetlights, flickering lamps, and exposed wires.'
    },
    {
      name: 'Water Supply',
      slug: 'water-supply',
      icon: Droplet,
      dept: 'Water Supply & Jal Board',
      desc: 'Dirty water, burst pipelines, and low water pressure.'
    },
    {
      name: 'Drainage',
      slug: 'drainage',
      icon: Dam,
      dept: 'Sewerage & Drainage Board',
      desc: 'Clogged drains, overflowing sewers, and flooded roads.'
    },
    {
      name: 'Public Spaces',
      slug: 'public-spaces',
      icon: Trees,
      dept: 'Parks & Recreation',
      desc: 'Damaged park benches, broken play equipment, and neglected grounds.'
    },
    {
      name: 'Other Issues',
      slug: 'other-issues',
      icon: HelpCircle,
      dept: 'Civic Helpdesk',
      desc: 'Encroachment, noise nuisance, and other local hazards.'
    }
  ];

  return (
    <div style={{ paddingBottom: '56px' }}>
      {/* Hero Section */}

      <section
        style={{
          position: 'relative',
          minHeight: '580px',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundImage: `
            linear-gradient(
              rgba(10, 18, 34, 0.12),
              rgba(10, 18, 34, 0.14)
            ),
            url(${heroBg})
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          padding: '52px 0 60px 0'
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '820px' }}>
            <img
              src={crpLogo}
              alt="CRP India - Citizen Redressal Platform"
              style={{
                width: '140px',
                height: '140px',
                objectFit: 'contain',
                margin: '0 0 20px 0',
                display: 'block',
                filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.4))'
              }}
            />

            {/* National Grievance Standard Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                color: '#FFFFFF',
                fontWeight: 500,
                marginBottom: '16px'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-accent-green, #22C55E)',
                  display: 'inline-block'
                }}
              />
              <span>Civic Problem Reporting Portal • Municipal Corporations of India</span>
            </div>

            <h1
              style={{
                fontSize: '2.35rem',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: '#FFFFFF',
                lineHeight: 1.25,
                marginBottom: '14px',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.45)'
              }}
            >
              Report civic problems directly to your local municipality.
            </h1>

            <p
              style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.92)',
                lineHeight: 1.6,
                marginBottom: '28px',
                textShadow: '0 1px 6px rgba(0, 0, 0, 0.35)'
              }}
            >
              CRP India enables residents to submit verified civic complaints—from road damage and garbage overflow to disrupted water supply—and track real-time resolution from municipal engineering teams.
            </p>

            {/* Main Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <Link
                to={!isAuthenticated ? '/login' : '/report'}
                state={!isAuthenticated ? { from: '/report', message: 'Please log in or register to report a civic issue.' } : undefined}
                className="btn btn-primary btn-lg btn-report-accent"
              >
                <span className="urgent-dot" />
                <span>Report an Issue</span>
              </Link>
              <Link
                to={!isAuthenticated ? '/login' : '/track'}
                state={!isAuthenticated ? { from: '/track', message: 'Please log in or register to track your complaints.' } : undefined}
                className="btn btn-secondary btn-lg"
              >
                <Search size={18} />
                <span>Track Complaint</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Distinct Feature Cards Section (Contrasting background visually separated from hero) */}
      <section className="civic-feature-section">
        <div className="container">
          <div className="civic-feature-grid">
            <div className="civic-feature-card">
              <div className="civic-feature-icon" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <Truck size={18} />
              </div>
              <div>
                <div className="civic-feature-title">Direct Municipal Dispatch</div>
                <div className="civic-feature-desc">
                  Sent directly to local ward engineers and sanitation officers.
                </div>
              </div>
            </div>

            <div className="civic-feature-card">
              <div className="civic-feature-icon" style={{ backgroundColor: 'var(--color-accent-blue-bg)', color: '#1D4ED8' }}>
                <Clock size={18} />
              </div>
              <div>
                <div className="civic-feature-title">Real-time Status Tracking</div>
                <div className="civic-feature-desc">
                  Track updates, actions, and official remarks at every step.
                </div>
              </div>
            </div>

            <div className="civic-feature-card">
              <div className="civic-feature-icon" style={{ backgroundColor: 'var(--color-accent-green-bg)', color: 'var(--color-accent-green)' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="civic-feature-title">Zero Filing Fees</div>
                <div className="civic-feature-desc">
                  A 100% free public service for all citizens.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Selection Section */}
      <section style={{ margin: '40px 0 28px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Select an Issue Category
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Click a category below to quickly file a complaint:
              </p>
            </div>
            <Link
              to={!isAuthenticated ? '/login' : '/report'}
              state={!isAuthenticated ? { from: '/report', message: 'Please log in or register to report a civic issue.' } : undefined}
              style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>View all categories</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Directory of Civic Categories */}
          <div className="category-grid">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  to={`/report/${cat.slug}`}
                  className={`category-card ${isActive ? 'is-active' : ''}`}
                  onClick={(e) => handleCategoryClick(e, cat.slug)}
                  aria-expanded={isActive}
                >
                  <div className="category-card-header">
                    <div className="category-card-icon">
                      <Icon size={18} />
                    </div>

                    <div className="category-card-body">
                      <div className="category-card-title-row">
                        <span className="category-card-title">
                          {cat.name}
                        </span>
                        <ArrowRight size={14} className="category-card-arrow" />
                      </div>
                      <div className="category-card-dept">
                        {cat.dept}
                      </div>
                    </div>
                  </div>

                  <div className="category-desc-drawer" aria-hidden={!isActive}>
                    <div className="category-desc-inner">
                      <p className="category-desc-text">
                        {cat.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Visual Process Flowchart */}
      <section style={{ padding: '36px 0 16px 0' }}>
        <div className="container">
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              How It Works
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Three simple steps to report and track a civic problem.
            </p>
          </div>

          <div className="flowchart-wrapper">
            {/* Step 01 */}
            <div className="flowchart-step">
              <div className="flowchart-circle">
                01
              </div>
              <h3 className="flowchart-title">
                Report a problem
              </h3>
              <p className="flowchart-desc">
                Choose the problem, location and add a photo if needed.
              </p>
            </div>

            {/* Connector 1 -> 2 */}
            <div className="flowchart-connector" aria-hidden="true">
              <div className="flowchart-connector-line" />
              <div className="flowchart-connector-arrow">
                <ArrowRight className="arrow-horizontal" size={18} strokeWidth={2.2} />
                <ArrowDown className="arrow-vertical" size={18} strokeWidth={2.2} />
              </div>
            </div>

            {/* Step 02 */}
            <div className="flowchart-step">
              <div className="flowchart-circle">
                02
              </div>
              <h3 className="flowchart-title">
                Sent to your local team
              </h3>
              <p className="flowchart-desc">
                We send it to the right municipal team.
              </p>
            </div>

            {/* Connector 2 -> 3 */}
            <div className="flowchart-connector" aria-hidden="true">
              <div className="flowchart-connector-line" />
              <div className="flowchart-connector-arrow">
                <ArrowRight className="arrow-horizontal" size={18} strokeWidth={2.2} />
                <ArrowDown className="arrow-vertical" size={18} strokeWidth={2.2} />
              </div>
            </div>

            {/* Step 03 */}
            <div className="flowchart-step">
              <div className="flowchart-circle">
                03
              </div>
              <h3 className="flowchart-title">
                Check your complaint
              </h3>
              <p className="flowchart-desc">
                Use your Reference ID to see updates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}