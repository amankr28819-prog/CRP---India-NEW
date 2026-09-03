import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Server,
  Share2,
  Bell,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  Phone,
  Mail
} from 'lucide-react';
import BackButton from '../components/BackButton';

export default function PrivacyPolicy() {
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
            <ShieldCheck size={15} />
            <span>Public Data Protection & Citizen Privacy</span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '10px' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            This Privacy Policy explains how CRP India (Civic Reporting Platform) collects, uses, shares, and protects your information when you report civic issues and track resolutions.
          </p>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Effective Date: January 1, 2026 • Last Updated: September 2026
          </div>
        </div>

        {/* Policy Content Card */}
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
              <span style={{ color: 'var(--color-primary)' }}>1.</span> Information We Collect
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
              To record and address municipal complaints effectively, CRP India collects the following types of information:
            </p>
            <ul style={{ paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Citizen Contact Details:</strong> When you register or lodge a complaint, we collect your full name, email address, and phone number. Contact details are optional for guest complaints but recommended so field inspectors can reach you if additional location clarification is required.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Complaint Information:</strong> Details regarding the civic issue, including the issue category (e.g., potholes, garbage, streetlights), title, detailed description, ward number, locality/landmark, and city.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Photographs & Evidence:</strong> Images uploaded by you showing the civic defect or public hazard. These images help municipal engineers assess severity and equipment requirements.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Geographical Location:</strong> Exact GPS coordinates (latitude and longitude) if you choose to use the "Use Current GPS Location" button, or address text provided by you.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Technical & Usage Logs:</strong> IP address, browser type, and interaction logs collected routinely for security monitoring, fraud prevention, and performance audits.
              </li>
            </ul>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 2 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>2.</span> How We Use Your Information
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
              All information collected is strictly utilized for public administration and civic redressal purposes:
            </p>
            <ul style={{ paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Municipal Routing:</strong> Automatically categorizing and dispatching your complaint to the appropriate municipal division (e.g., Public Works, Solid Waste, Jal Board, Electrical Division).
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Tracking & Reference:</strong> Generating a unique complaint Reference ID (e.g., <code style={{ color: 'var(--color-primary)', backgroundColor: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px' }}>CRP-2026-XXXXX</code>) so you and municipal officers can monitor progress milestones.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Field Investigation:</strong> Allowing assigned municipal inspectors to verify the physical location and schedule repairs or sanitation crews.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Status Notifications:</strong> Providing updates as your grievance progresses from Submitted to In Progress, Under Review, and Resolved.
              </li>
            </ul>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 3 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>3.</span> Sharing Information with Municipal Authorities
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              CRP India acts as an official digital bridge between citizens and local urban municipal bodies.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              Your complaint details (location, description, photos, and contact info) are made accessible to designated municipal engineers, sanitary inspectors, and administrative zonal officers assigned to your ward.
            </p>
            <div style={{ padding: '14px 18px', backgroundColor: 'var(--color-accent-green-bg)', borderLeft: '4px solid var(--color-accent-green)', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <strong>No Commercial Sale:</strong> CRP India never sells, rents, or commercializes citizen data or contact details to marketing agencies, advertisers, or third-party commercial entities.
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 4 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>4.</span> Data Security & Storage
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              We implement industry-standard organizational and technical measures to protect your personal information:
            </p>
            <ul style={{ paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Encryption:</strong> All data transmitted between your browser and our servers is encrypted using Secure Sockets Layer / Transport Layer Security (HTTPS/TLS).
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Role-Based Access:</strong> Municipal administrative accounts require authentication and access controls so that officers only view complaints within their jurisdiction.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Password Security:</strong> User account passwords are encrypted using one-way cryptographic hashing (bcrypt) before database storage.
              </li>
            </ul>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 5 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>5.</span> Data Retention
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Complaint records and associated photos are retained on the municipal registry for historical audit, service timeline compliance, and public infrastructure tracking. Personal contact information associated with inactive accounts can be updated or removed upon request, subject to statutory record-keeping guidelines.
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 6 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>6.</span> Cookies & Local Storage
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              CRP India utilizes minimal, strictly necessary local storage:
            </p>
            <ul style={{ paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Theme Preference:</strong> Storing your choice of Light or Dark mode.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Session Tokens:</strong> Storing temporary authentication tokens (<code style={{ color: 'var(--color-primary)', backgroundColor: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px' }}>crp_token</code>) so you remain logged in during your session.
              </li>
              <li>
                <strong style={{ color: 'var(--text-primary)' }}>Portal Role:</strong> Remembering whether you entered as a Citizen or Municipal Official.
              </li>
            </ul>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 7 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>7.</span> Citizen Rights & Choices
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              As a citizen using CRP India, you have the right to:
            </p>
            <ul style={{ paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Check the status and history of any complaint using your Reference ID at any time.</li>
              <li>Submit complaints without creating a permanent account if you prefer not to register.</li>
              <li>Request corrections to your personal contact details by reaching out to our grievance desk.</li>
            </ul>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 8 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>8.</span> Third-Party Services
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The platform may utilize third-party map tiling (such as OpenStreetMap or Google Maps) to display geographical references. These services may collect standardized IP and telemetry data under their respective privacy policies.
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 9 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>9.</span> Changes to This Privacy Policy
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We may periodically update this policy to reflect enhancements in civic grievance workflows or statutory regulations. Any modifications will be posted directly on this page with an updated revision date.
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

          {/* Section 10 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-primary)' }}>10.</span> Privacy Contact & Support
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
              If you have any questions or concerns regarding our privacy practices or how your data is handled, please contact our support team:
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