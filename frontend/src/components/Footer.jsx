import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin } from 'lucide-react';
import crpLogo from '../assets/crp-logo.png';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--bg-footer)', color: 'var(--text-footer)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '40px 0 24px 0', fontSize: '0.875rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', marginBottom: '32px', alignItems: 'start' }}>
          {/* Section 1: CRP India Branding */}
          <div>
            <img
              src={crpLogo}
              alt="CRP India Logo"
              style={{
                width: '220px',
                maxWidth: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '8px',
                display: 'block'
              }}
            />
          </div>

          {/* Section 2: Navigation */}
          <div>
            <h4 style={{ color: 'var(--text-footer-heading)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <Link to="/" style={{ color: 'var(--text-footer)', transition: 'color 0.15s' }}>Home</Link>
              </li>
              <li>
                <Link to="/report" style={{ color: 'var(--text-footer)', transition: 'color 0.15s' }}>Report an Issue</Link>
              </li>
              <li>
                <Link to="/track" style={{ color: 'var(--text-footer)', transition: 'color 0.15s' }}>Track Complaint</Link>
              </li>
              <li>
                <Link to="/about" style={{ color: 'var(--text-footer)', transition: 'color 0.15s' }}>About Platform</Link>
              </li>
              <li>
                <Link to="/authority/login" style={{ color: 'var(--text-footer)', transition: 'color 0.15s' }}>Municipal Authority Portal</Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Priority Categories */}
          <div>
            <h4 style={{ color: 'var(--text-footer-heading)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Categories
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <Link to="/report/roads-potholes" style={{ color: 'var(--text-footer)' }}>Roads & Potholes</Link>
              </li>
              <li>
                <Link to="/report/garbage-sanitation" style={{ color: 'var(--text-footer)' }}>Garbage & Sanitation</Link>
              </li>
              <li>
                <Link to="/report/streetlights" style={{ color: 'var(--text-footer)' }}>Streetlights</Link>
              </li>
              <li>
                <Link to="/report/water-supply" style={{ color: 'var(--text-footer)' }}>Water Supply</Link>
              </li>
              <li>
                <Link to="/report/drainage" style={{ color: 'var(--text-footer)' }}>Drainage & Sewerage</Link>
              </li>
            </ul>
          </div>

          {/* Section 4: Legal & Contact */}
          <div>
            <h4 style={{ color: 'var(--text-footer-heading)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Legal & Support
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <Link to="/privacy" style={{ color: 'var(--text-footer)' }}>Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" style={{ color: 'var(--text-footer)' }}>Terms of Service</Link>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.8125rem' }}>
                <Phone size={13} />
                <span>Toll-Free Helpline: 1800-11-2026</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                <Mail size={13} />
                <span>grievance@crp.gov.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.75rem' }}>
          <div>
            &copy; {new Date().getFullYear()} CRP India. All Rights Reserved. Civic Infrastructure & Grievance Division.
          </div>
          <div>
            <span>Compliant with Citizen Charter Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}