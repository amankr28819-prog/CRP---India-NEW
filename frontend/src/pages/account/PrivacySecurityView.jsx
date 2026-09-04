import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  FileText,
  KeyRound,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PrivacySecurityView() {
  const { user, requestLogout } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Privacy, Identity & Security
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          Overview of your account security protocols, voter data governance, and privacy disclosures.
        </p>
      </div>

      {/* Security Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-accent-green-bg, #DCFCE7)',
              color: 'var(--color-accent-green, #15803D)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Encrypted Session
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Your session is authenticated via cryptographic JSON Web Tokens (JWT) with automated expiration.
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-accent-blue-bg, #DBEAFE)',
              color: 'var(--color-primary, #1E40AF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Lock size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Password Hash Protection
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Passwords are salted and irreversibly hashed using standard bcrypt algorithms.
            </div>
          </div>
        </div>
      </div>

      {/* Voter ID Data Protection Notice */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShieldCheck size={20} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Voter ID (EPIC) & Identity Protection Policy
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
          The Civic Reporting Platform (CRP India) utilizes citizen voter identity to guarantee authenticity and prevent fraudulent or bot-automated civic submissions. In alignment with modern data governance guidelines:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--color-accent-green)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              <strong>Masked Display:</strong> Your Voter ID is masked (`••••••••1234`) across all public interfaces and requires re-authentication with your password to reveal.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--color-accent-green)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              <strong>Restricted Officer Access:</strong> Only authorized municipal nodal officers assigned to your specific ward can verify your contact coordinates for on-ground repair coordination.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--color-accent-green)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              <strong>No Third-Party Sharing:</strong> Your registered credentials are never monetized, rented, or distributed to non-governmental marketing third parties.
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}
        >
          <em>Note:</em> In this demonstration environment, Voter IDs are simulated dummy identifiers for citizen verification workflows.
        </div>
      </div>

      {/* Security Quick Actions */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '24px'
        }}
      >
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
          Security & Legal Actions
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <Link
            to="/account/change-password"
            className="btn btn-secondary"
            style={{ justifyContent: 'space-between', padding: '12px 16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyRound size={16} style={{ color: 'var(--color-primary)' }} />
              <span>Change Password</span>
            </div>
            <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
          </Link>

          <Link
            to="/privacy"
            className="btn btn-secondary"
            style={{ justifyContent: 'space-between', padding: '12px 16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} style={{ color: 'var(--color-primary)' }} />
              <span>Privacy Policy</span>
            </div>
            <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
          </Link>

          <Link
            to="/terms"
            className="btn btn-secondary"
            style={{ justifyContent: 'space-between', padding: '12px 16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} style={{ color: 'var(--color-primary)' }} />
              <span>Terms of Service</span>
            </div>
            <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
          </Link>

          <button
            type="button"
            onClick={requestLogout}
            className="btn btn-secondary"
            style={{
              justifyContent: 'space-between',
              padding: '12px 16px',
              color: 'var(--color-status-rejected)',
              borderColor: 'rgba(220, 38, 38, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogOut size={16} />
              <span>Sign Out Everywhere</span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>End Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
