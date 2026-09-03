import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Scale,
  Shield,
  HelpCircle,
  ArrowLeft,
  Phone,
  Mail,
  Building
} from 'lucide-react';
import BackButton from '../components/BackButton';

export default function TermsOfService() {
  return (
    <div style={{ padding: '36px 0 64px 0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <BackButton fallback="/" />

        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              borderRadius: '4px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '12px'
            }}
          >
            <Scale size={15} />
            <span>Platform Usage & Service Guidelines</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '10px' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Please read these Terms of Service carefully before using CRP India (Civic Reporting Platform). By accessing the website or submitting a complaint, you agree to comply with these terms.
          </p>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Effective Date: January 1, 2026 • Last Updated: September 2026
          </div>
        </div>

        {/* Content Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
          }}
        >
          {/* Section 1 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>1.</span> Purpose of the Platform
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              CRP India is a non-commercial civic reporting gateway designed to empower Indian citizens to report municipal and civic infrastructure defects—such as potholes, uncollected waste, dark streetlights, drainage blockages, and water supply disruptions—directly to their respective municipal corporations and ward engineering divisions.
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 2 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>2.</span> Eligibility & User Responsibilities
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              By using CRP India, you represent and warrant that:
            </p>
            <ul style={{ paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>You are a resident or visitor located in India reporting genuine civic issues affecting public spaces or utilities.</li>
              <li>You will use the platform in good faith to assist municipal corporations in maintaining public infrastructure.</li>
              <li>You will not impersonate any individual, organization, or municipal official.</li>
            </ul>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 3 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>3.</span> Submitting Complaints & Accuracy Requirement
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              When submitting a complaint, you agree to:
            </p>
            <ul style={{ paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Provide clear, truthful, and accurate information regarding the location, landmarks, and nature of the issue.</li>
              <li>Select the most suitable category so the report reaches the correct engineering or sanitation department.</li>
              <li>Provide accurate optional contact information if you wish to receive resolution verification inquiries from field officers.</li>
            </ul>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 4 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>4.</span> Prohibited Conduct & Fake Complaints
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              To ensure municipal resources are dispatched fairly to real public hazards, the following actions are strictly prohibited:
            </p>
            <ul style={{ paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Submitting false, fabricated, fictitious, or prank complaints.</li>
              <li>Submitting repetitive spam complaints for an issue that has already been registered and is under active investigation.</li>
              <li>Using vulgar, abusive, threatening, defamatory, or politically partisan language in complaint descriptions.</li>
              <li>Promoting commercial products, services, or personal grievances unrelated to public municipal infrastructure.</li>
            </ul>
            <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: 'var(--color-accent-amber-bg)', borderLeft: '4px solid var(--color-accent-amber)', borderRadius: '4px', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
              <strong>Notice:</strong> Submitting malicious or intentionally false reports that waste emergency civic resources may result in permanent platform banning and referral to local authorities under applicable laws.
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 5 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>5.</span> Uploaded Photos & Media
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              Citizens are encouraged to upload photos demonstrating civic issues. By uploading photos:
            </p>
            <ul style={{ paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>You confirm that the photograph represents the actual condition of the public site described.</li>
              <li>You grant CRP India and jurisdictional municipal corporations the license to view, store, and share the media with field crews for repair planning.</li>
              <li>You must not upload copyrighted images from the internet, private personal portraits without consent, or graphic/inappropriate content.</li>
            </ul>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 6 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>6.</span> Complaint Processing & Municipal Role
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              CRP India acts as an intake and communication management platform. The physical repair, cleaning, maintenance, and allocation of budget or manpower remain the sole statutory responsibility of the respective Municipal Corporation, Urban Local Body, or Public Works Department. CRP India facilitates rapid routing and transparent tracking but does not independently execute on-ground physical construction.
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 7 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>7.</span> Reference IDs & Tracking
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Upon successful registration, you receive a unique Reference ID in the format <code style={{ color: 'var(--color-primary)', backgroundColor: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px' }}>CRP-YYYY-XXXXX</code>. You should retain this ID to view real-time stage updates, official remarks, and assigned inspector details via the Track Complaint portal.
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 8 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>8.</span> Service Availability & Limitation of Liability
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              While we strive for continuous 24/7 portal availability:
            </p>
            <ul style={{ paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>The service is provided on an "as is" and "as available" basis without guarantees of uninterrupted uptime during server maintenance or natural disruptions.</li>
              <li>CRP India is not liable for delayed physical repairs caused by municipal strikes, weather hazards, budget shortfalls, or jurisdictional disputes between government departments.</li>
              <li>For immediate life-threatening crises (such as collapsed buildings, active electrocution hazards, or major floods), citizens must also contact national emergency helplines (112 / Fire / Police).</li>
            </ul>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 9 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>9.</span> User Accounts & Credential Security
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              If you create a registered citizen account, you are responsible for maintaining the confidentiality of your login credentials and for all activities conducted through your account. Please notify us immediately if you suspect unauthorized access.
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 10 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>10.</span> Modifications to Terms
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We reserve the right to revise these Terms of Service at any time. Any changes will be published on this page with an updated effective date. Continued usage of the platform following modifications constitutes acceptance of the updated terms.
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 11 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>11.</span> Contact & Grievance Desk
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
              If you have any questions regarding these Terms or need assistance with platform usage, please contact our civic helpdesk:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Inquiries</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>grievance@crp.gov.in</div>
                </div>
              </div>

              <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={18} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Toll-Free Helpline</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>1800-11-2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}