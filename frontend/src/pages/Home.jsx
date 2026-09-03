import React from 'react';
import { Link } from 'react-router-dom';
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
  ArrowRight
} from 'lucide-react';

export default function Home() {
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
      <section style={{ backgroundColor: 'var(--bg-surface)', padding: '44px 0 36px 0' }}>
        <div className="container">
          <div style={{ maxWidth: '780px' }}>
            {/* National Grievance Standard Tag */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent-green)', display: 'inline-block' }} />
              <span>Civic Problem Reporting Portal • Municipal Corporations of India</span>
            </div>

            <h1 style={{ fontSize: '2.35rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '14px' }}>
              Report civic problems to your local municipality.
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              Easily report potholes, garbage, streetlights, or water problems and track resolution in real time.
            </p>

            {/* Main Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <Link to="/report" className="btn btn-primary btn-lg btn-report-accent">
                <span className="urgent-dot" />
                <span>Report an Issue</span>
              </Link>
              <Link to="/track" className="btn btn-secondary btn-lg">
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
            <Link to="/report" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>View all categories</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Directory of Civic Categories */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  to={`/report/${cat.slug}`}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '16px 18px',
                    transition: 'border-color 0.15s ease, background-color 0.15s ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {cat.name}
                      </span>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 500, marginTop: '2px', marginBottom: '3px' }}>
                      {cat.dept}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {cat.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Simplified, Citizen-Friendly 3 Step Flow */}
      <section style={{ padding: '36px 0 12px 0' }}>
        <div className="container">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              How It Works
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Three simple steps to resolve issues in your neighborhood.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Step 1
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Report a problem
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Pick a category, describe the issue, add the location, and optionally attach photos.
              </p>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Step 2
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Sent to your local team
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Your issue is sent directly to the right municipal department and field officer.
              </p>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Step 3
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Check your complaint
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Use your Reference ID to see live updates until the problem is fixed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}