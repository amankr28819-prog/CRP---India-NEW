import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  CheckCircle,
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
    { name: 'Roads & Potholes', slug: 'roads-potholes', icon: AlertTriangle, desc: 'Potholes, broken footpaths, road cave-ins' },
    { name: 'Garbage & Sanitation', slug: 'garbage-sanitation', icon: Trash2, desc: 'Overflowing bins, uncollected waste, littering' },
    { name: 'Streetlights', slug: 'streetlights', icon: Lightbulb, desc: 'Dark streetlights, flickering poles, exposed wiring' },
    { name: 'Water Supply', slug: 'water-supply', icon: Droplet, desc: 'Contaminated water, pipeline burst, low pressure' },
    { name: 'Drainage', slug: 'drainage', icon: Dam, desc: 'Clogged stormwater drains, sewage overflow, waterlogging' },
    { name: 'Public Spaces', slug: 'public-spaces', icon: Trees, desc: 'Damaged park benches, broken playground equipment' },
    { name: 'Other Issues', slug: 'other-issues', icon: HelpCircle, desc: 'Encroachment, noise nuisance, civic violations' }
  ];

  return (
    <div style={{ paddingBottom: '64px' }}>
      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', padding: '56px 0 48px 0' }}>
        <div className="container">
          <div style={{ maxWidth: '820px' }}>
            {/* National Grievance Standard Tag */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent-green)', display: 'inline-block' }} />
              <span>Direct Public Portal • Municipal Corporations of India</span>
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '16px' }}>
              Report civic problems directly to your local municipality.
            </h1>

            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
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

      {/* Feature Highlights: Horizontally aligned on desktop, no awkward wrapping */}
      <div className="container">
        <div className="features-row">
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px'
            }}
          >
            <div style={{ padding: '8px', backgroundColor: 'var(--color-primary-light)', borderRadius: '6px', color: 'var(--color-primary)', display: 'flex' }}>
              <Truck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Direct Municipal Dispatch
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Submissions automatically route to designated ward engineers and sanitary inspectors.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px'
            }}
          >
            <div style={{ padding: '8px', backgroundColor: 'var(--color-accent-blue-bg)', borderRadius: '6px', color: '#1D4ED8', display: 'flex' }}>
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Real-time Status Tracking
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Follow chronological progress from submission through work order dispatch and resolution.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px'
            }}
          >
            <div style={{ padding: '8px', backgroundColor: 'var(--color-accent-green-bg)', borderRadius: '6px', color: 'var(--color-accent-green)', display: 'flex' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Zero Filing Fees
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                A 100% free public civic service under the national grievance redressal guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Selection Section */}
      <section style={{ margin: '40px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Select a Civic Issue Category
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Click any category to immediately lodge an official complaint.
              </p>
            </div>
            <Link to="/report" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>View all categories</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Grid of categories */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
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
                    padding: '20px',
                    transition: 'border-color 0.15s ease, transform 0.1s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', color: 'var(--color-primary)', display: 'flex' }}>
                      <Icon size={20} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {cat.name}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {cat.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Citizen Charter & Resolution Standards */}
      <section style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '48px 0', margin: '48px 0 0 0' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Citizen Charter: Guaranteed Redressal Timelines
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              In accordance with municipal service charters, complaints filed via CRP India are subjected to strict resolution SLAs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '18px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', borderLeft: '3px solid var(--color-primary)' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Sanitation & Garbage</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '6px 0' }}>24 Hours</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dumpster clearance & road sweeping</div>
            </div>

            <div style={{ padding: '18px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', borderLeft: '3px solid var(--color-primary)' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Roads & Potholes</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '6px 0' }}>48 Hours</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cold-mix asphalt patch & hazard barricading</div>
            </div>

            <div style={{ padding: '18px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', borderLeft: '3px solid var(--color-primary)' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Streetlights</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '6px 0' }}>72 Hours</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LED fixture replacement & feeder line checks</div>
            </div>

            <div style={{ padding: '18px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', borderLeft: '3px solid var(--color-primary)' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Water & Drainage</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '6px 0' }}>24 Hours</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pipeline leakage isolation & drain desilting</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Step Flow */}
      <section style={{ padding: '48px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 36px auto' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              How Civic Redressal Works
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
              A transparent, three-step grievance process built for Indian municipal governance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px' }}>
                1
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Lodge Grievance
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Select the issue category, provide the locality, ward, optional GPS coordinates, and upload photographic evidence.
              </p>
            </div>

            <div style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px' }}>
                2
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Municipal Allocation
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                The complaint is automatically mapped to the relevant zonal municipal department and assigned to a field officer.
              </p>
            </div>

            <div style={{ padding: '24px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', marginBottom: '14px' }}>
                3
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
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