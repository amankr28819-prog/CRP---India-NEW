import React from 'react';
import { Shield, BookOpen, Clock, Phone, Mail, Building, Users } from 'lucide-react';
import BackButton from '../components/BackButton';

export default function About() {
  return (
    <div className="container" style={{ padding: '36px 20px 80px 20px', maxWidth: '860px' }}>
      <BackButton fallback="/" />
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 className="page-title">About CRP India</h1>
        <p className="page-subtitle">
          Civic Reporting Platform — Modernizing municipal grievance redressal and public accountability across India.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Mission */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Mission & Governance Purpose
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
            CRP India was established to bridge the communications gap between city residents and municipal engineering corporations. By providing an open, transparent, and auditable digital tracking system, the platform ensures that civic complaints—ranging from pothole hazards to sanitation overflows—are systematically recorded, assigned to field inspectors, and resolved within guaranteed service-level agreements (SLAs).
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Every submission generates a cryptographic reference identifier, enabling citizens to monitor each step in the resolution lifecycle without intermediaries.
          </p>
        </div>

        {/* Hierarchy of Redressal */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Grievance Escalation Framework
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Level 1: Ward Field Officer
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Initial on-site inspection, work order issue, and field labor deployment.
              </p>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Level 2: Zonal Executive Engineer
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Departmental resource allocation, contractor coordination, and quality checks.
              </p>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Level 3: Municipal Commissioner
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Audit oversight, unresolved SLA breaches, and civic accountability review.
              </p>
            </div>
          </div>
        </div>

        {/* Legal & Privacy policies section */}
        <div id="privacy" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Privacy Policy & Citizen Data Protection
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
            Citizen personal data (phone numbers and email addresses) are strictly utilized for municipal field verification and SMS/email updates. Data is encrypted in transit and at rest, and is never shared with third-party advertising or commercial entities.
          </p>
        </div>

        {/* Terms of Service */}
        <div id="terms" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Terms of Public Civic Redressal
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Users agree to submit truthful, accurate, and non-frivolous complaints relating strictly to public infrastructure and municipal amenities. Misuse of emergency channels or submitting fraudulent records is subject to civic penalties under municipal bylaws.
          </p>
        </div>
      </div>
    </div>
  );
}