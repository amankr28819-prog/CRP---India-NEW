import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function RoleSelection() {
  const navigate = useNavigate();
  const { selectPortal, isAuthority, isAuthenticated } = useAuth();

  const handleSelectRole = (role) => {
    selectPortal(role);
    if (role === 'citizen') {
      navigate('/');
    } else {
      if (isAuthenticated && isAuthority) {
        navigate('/authority/dashboard');
      } else {
        navigate('/authority/login');
      }
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative'
      }}
    >
      {/* Top right theme toggle */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: '680px', textAlign: 'center' }}>
        {/* National Identity Emblem Header */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '20px', border: '1px solid var(--border-subtle)', marginBottom: '24px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: '#FF9933' }}>●</span>
          <span style={{ color: '#000080' }}>●</span>
          <span style={{ color: '#138808' }}>●</span>
          <span>Official Civic Grievance & Municipal Resolution Gateway</span>
        </div>

        <h1 style={{ fontSize: '2.1rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '10px' }}>
          CRP India
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          How would you like to continue?
        </p>

        {/* Two clean, professional options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', textAlign: 'left' }}>
          {/* Option 1: Citizen */}
          <div
            onClick={() => handleSelectRole('citizen')}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '28px 24px',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, transform 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px'
                }}
              >
                <Users size={24} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Citizen
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Report and track civic issues in your area.
              </p>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
              <span>Enter Citizen Portal</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Option 2: Municipal Authority */}
          <div
            onClick={() => handleSelectRole('authority')}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1.5px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '28px 24px',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, transform 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-accent-blue-bg)',
                  color: '#1D4ED8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px'
                }}
              >
                <Building2 size={24} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Municipal Authority
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Manage complaints and coordinate civic resolution.
              </p>
            </div>

            <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
              <span>Access Authority Portal</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>

        {/* Security & Verification Notice */}
        <div style={{ marginTop: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={16} style={{ color: 'var(--color-accent-green)' }} />
          <span>Secure SSL Encrypted • Direct municipal integration • Public Service Oversight</span>
        </div>
      </div>
    </div>
  );
}