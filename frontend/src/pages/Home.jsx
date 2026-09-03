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
  ArrowRight,
  Building,
  CheckCircle2
} from 'lucide-react';

export default function Home() {
  const categories = [
    {
      name: 'Roads & Potholes',
      slug: 'roads-potholes',
      icon: AlertTriangle,
      dept: 'Public Works Department (Roads)',
      desc: 'Potholes, broken pavement, surface craters, missing manhole covers.'
    },
    {
      name: 'Garbage & Sanitation',
      slug: 'garbage-sanitation',
      icon: Trash2,
      dept: 'Solid Waste & Sanitation',
      desc: 'Overflowing dumpsters, uncollected waste, illegal dumping, street sweeping.'
    },
    {
      name: 'Streetlights',
      slug: 'streetlights',
      icon: Lightbulb,
      dept: 'Municipal Electrical Division',
      desc: 'Dark streetlights, flickering fixtures, exposed wiring, timer faults.'
    },
    {
      name: 'Water Supply',
      slug: 'water-supply',
      icon: Droplet,
      dept: 'Water Supply & Jal Board',
      desc: 'Contaminated tap water, mainline burst, erratic supply hours.'
    },
    {
      name: 'Drainage',
      slug: 'drainage',
      icon: Dam,
      dept: 'Stormwater & Sewerage Board',
      desc: 'Clogged roadside gutters, sewer overflow, waterlogging during rainfall.'
    },
    {
      name: 'Public Spaces',
      slug: 'public-spaces',
      icon: Trees,
      dept: 'Parks & Public Amenities',
      desc: 'Damaged park equipment, illegal hoarding, broken footpath pavers.'
    },
    {
      name: 'Other Issues',
      slug: 'other-issues',
      icon: HelpCircle,
      dept: 'Central Grievance Redressal Cell',
      desc: 'Encroachment, noise nuisance beyond permissible hours, civic hazards.'
    }
  ];

  return (
    <div style={{ paddingBottom: '72px' }}>
      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--bg-surface)', padding: '52px 0 44px 0' }}>
        <div className="container">
          <div style={{ maxWidth: '820px' }}>
            {/* National Grievance Standard Tag */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent-green)', display: 'inline-block' }} />
              <span>Public Civic Grievance Gateway • Municipal Corporations of India</span>
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '16px' }}>
              Report civic problems directly to your local municipality.
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
              CRP India enables residents to submit verified civic complaints—from road damage and garbage overflow to disrupted water supply—and track real-time resolution from municipal engineering teams.
            </p>

            {/* Main Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <Link to="/report" className="btn btn-primary btn-lg btn-report-accent">
                <span className="urgent-dot" />
                <span>Report an Issue</span>
              </Link>
              <Link to="/track" className="btn btn-secondary btn-lg">
                <Search size={18} />
                <span>Track Complaint Status</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Human-Designed Civic Service Strip (Replaced separate floating AI cards) */}
      <div className="civic-service-strip">
        <div className="container" style={{ padding: 0 }}>
          <div className="civic-service-grid">
            <div className="civic-service-item">
              <div className="civic-service-icon" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <Truck size={18} />
              </div>
              <div>
                <div className="civic-service-title">Direct Municipal Dispatch</div>
                <div className="civic-service-desc">
                  Submissions automatically route to designated ward engineers and sanitary inspectors.
                </div>
              </div>
            </div>

            <div className="civic-service-item">
              <div className="civic-service-icon" style={{ backgroundColor: 'var(--color-accent-blue-bg)', color: '#1D4ED8' }}>
                <Clock size={18} />
              </div>
              <div>
                <div className="civic-service-title">Real-time Status Tracking</div>
                <div className="civic-service-desc">
                  Follow chronological progress from submission through work order dispatch and resolution.
                </div>
              </div>
            </div>

            <div className="civic-service-item">
              <div className="civic-service-icon" style={{ backgroundColor: 'var(--color-accent-green-bg)', color: 'var(--color-accent-green)' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="civic-service-title">Zero Filing Fees</div>
                <div className="civic-service-desc">
                  A 100% free public civic service under the national grievance redressal guidelines.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Selection Section */}
      <section style={{ margin: '48px 0 32px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Select a Civic Issue Category
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Click any category to immediately lodge an official complaint with the responsible division.
              </p>
            </div>
            <Link to="/report" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>View full directory</span>
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
                    borderRadius: '4px',
                    padding: '18px 20px',
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
                      width: '36px',
                      height: '36px',
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 500, marginTop: '2px', marginBottom: '4px' }}>
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

      {/* Citizen Charter: SLA Timelines */}
      <section style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '44px 0', margin: '48px 0 0 0' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Citizen Charter: Guaranteed Redressal Timelines
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              In accordance with municipal service charters, complaints filed via CRP India are subjected to strict resolution SLAs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', borderLeft: '3px solid var(--color-primary)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Sanitation & Waste</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>24 Hours</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dumpster clearance & street sweeping</div>
            </div>

            <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', borderLeft: '3px solid var(--color-primary)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Roads & Potholes</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>48 Hours</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Asphalt patching & hazard cordoning</div>
            </div>

            <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', borderLeft: '3px solid var(--color-primary)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Street Lighting</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>72 Hours</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>LED fixture repair & feeder line diagnosis</div>
            </div>

            <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', borderLeft: '3px solid var(--color-primary)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Water & Drainage</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0' }}>24 Hours</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pipeline burst isolation & drain desilting</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '48px 0' }}>
        <div className="container">
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              How Civic Redressal Works
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              A transparent three-step procedure governing citizen grievance intake and municipal execution.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Step 1 • Grievance Submission
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Lodge Grievance
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Select the issue category, provide the locality, ward, optional GPS coordinates, and upload photographic evidence.
              </p>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Step 2 • Zonal Allocation
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Municipal Allocation
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                The complaint routes to the designated municipal engineering division and is assigned to an on-ground field inspector.
              </p>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Step 3 • Live Verification
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Track & Confirm
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Use your unique Reference ID to observe status milestones from review to field inspection and final resolution.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}