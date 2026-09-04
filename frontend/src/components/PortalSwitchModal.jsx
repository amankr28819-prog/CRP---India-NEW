import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PortalSwitchModal() {
  const navigate = useNavigate();
  const { showPortalSwitchModal, cancelPortalSwitch, confirmPortalSwitch } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showPortalSwitchModal) {
        cancelPortalSwitch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPortalSwitchModal, cancelPortalSwitch]);

  if (!showPortalSwitchModal) return null;

  const handleConfirm = () => {
    confirmPortalSwitch();
    navigate('/home', { replace: true });
  };

  return (
    <div
      className="logout-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          cancelPortalSwitch();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-switch-dialog-title"
        className="logout-confirm-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon matching existing logout modal */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.22)',
            color: 'var(--color-status-rejected, #EF4444)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px auto'
          }}
        >
          <LogOut size={26} />
        </div>

        {/* Dialog Heading */}
        <h2
          id="portal-switch-dialog-title"
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '8px',
            letterSpacing: '-0.01em'
          }}
        >
          Switch to Citizen Portal
        </h2>

        {/* Contextual Description */}
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            marginBottom: '26px'
          }}
        >
          You are switching to Citizen Portal.
          <br />
          You will be logged out from the Municipal Portal.
        </p>

        {/* Modal Actions: exactly two actions: "Back" and "Logout" */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            type="button"
            onClick={cancelPortalSwitch}
            className="btn btn-secondary"
            style={{
              padding: '10px 16px',
              fontWeight: 600,
              justifyContent: 'center',
              width: '100%',
              borderRadius: '8px'
            }}
            autoFocus
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn"
            style={{
              backgroundColor: 'var(--color-status-rejected, #DC2626)',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 16px',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              width: '100%',
              transition: 'opacity 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
