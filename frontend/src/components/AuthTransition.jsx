import React from 'react';
import { ShieldCheck, UserCheck, Building2, LogOut } from 'lucide-react';
import crpLogo from '../assets/crp-logo.png';

export default function AuthTransition({
  isOpen,
  title = 'Signing In...',
  subtitle,
  redirectText = 'Redirecting...',
  type = 'login' // 'login' | 'authority' | 'register' | 'logout'
}) {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (type) {
      case 'register':
        return <UserCheck size={26} style={{ color: '#22C55E' }} />;
      case 'authority':
        return <Building2 size={26} style={{ color: '#60A5FA' }} />;
      case 'logout':
        return <LogOut size={26} style={{ color: '#EF4444' }} />;
      case 'login':
      default:
        return <ShieldCheck size={26} style={{ color: '#3B82F6' }} />;
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case 'register':
        return '#22C55E';
      case 'logout':
        return '#EF4444';
      case 'authority':
      case 'login':
      default:
        return '#3B82F6';
    }
  };

  const accentColor = getAccentColor();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="auth-transition-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px'
      }}
    >
      <div
        className="auth-transition-card"
        style={{
          backgroundColor: '#0F1829',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '36px 32px 30px 32px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(59, 130, 246, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle top ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '20%',
            right: '20%',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`
          }}
        />

        {/* Small CRP Logo Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px', opacity: 0.9 }}>
          <img
            src={crpLogo}
            alt="CRP India"
            style={{
              height: '28px',
              width: 'auto',
              maxHeight: '28px',
              objectFit: 'contain'
            }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            CRP India Official
          </span>
        </div>

        {/* Circular Spinner with Center Icon Badge */}
        <div
          style={{
            position: 'relative',
            width: '76px',
            height: '76px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Outer rotating SVG spinner ring */}
          <svg
            className="auth-spinner-ring"
            viewBox="0 0 50 50"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              animation: 'authSpin 1.1s linear infinite'
            }}
          >
            <circle
              cx="25"
              cy="25"
              r="22"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="3.5"
            />
            <circle
              cx="25"
              cy="25"
              r="22"
              fill="none"
              stroke={accentColor}
              strokeWidth="3.5"
              strokeDasharray="95"
              strokeDashoffset="60"
              strokeLinecap="round"
            />
          </svg>

          {/* Inner Badge */}
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {renderIcon()}
          </div>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.015em',
            margin: '0 0 6px 0',
            lineHeight: 1.3
          }}
        >
          {title}
        </h3>

        {/* Subtitle (e.g. for registration) */}
        {subtitle && (
          <p
            style={{
              fontSize: '0.925rem',
              color: '#93C5FD',
              fontWeight: 600,
              margin: '0 0 8px 0',
              lineHeight: 1.4
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Redirect text */}
        <p
          style={{
            fontSize: '0.85rem',
            color: '#94A3B8',
            margin: '0 0 20px 0',
            fontWeight: 500
          }}
        >
          {redirectText}
        </p>

        {/* Subtle Horizontal Progress Indicator Bar */}
        <div
          style={{
            width: '100%',
            height: '3px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '2px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div
            className="auth-progress-bar"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              backgroundColor: accentColor,
              borderRadius: '2px',
              animation: 'authProgress 1.2s ease-in-out infinite'
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes authSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes authFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes authScaleUp {
          from { transform: scale(0.95) translateY(6px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes authProgress {
          0% { left: -35%; width: 35%; }
          50% { left: 30%; width: 50%; }
          100% { left: 100%; width: 35%; }
        }
        .auth-transition-overlay {
          animation: authFadeIn 180ms ease-out forwards;
        }
        .auth-transition-card {
          animation: authScaleUp 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
