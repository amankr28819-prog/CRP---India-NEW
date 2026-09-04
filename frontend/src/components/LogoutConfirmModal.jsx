import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthTransition from './AuthTransition';

export default function LogoutConfirmModal() {
  const navigate = useNavigate();
  const { showLogoutModal, cancelLogout, confirmLogout, user, isAuthority } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showLogoutModal && !isTransitioning) {
        cancelLogout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutModal, cancelLogout, isTransitioning]);

  if (!showLogoutModal && !isTransitioning) return null;

  const handleConfirm = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      confirmLogout();
      setIsTransitioning(false);
      navigate('/', { replace: true });
    }, 1200);
  };

  if (isTransitioning) {
    return (
      <AuthTransition
        isOpen={true}
        title="Signing Out..."
        redirectText="Redirecting to Home..."
        type="logout"
      />
    );
  }

  return (
    <div
      className="logout-modal-backdrop"
      onClick={(e) => {
        // Clicking backdrop closes modal safely without logging out
        if (e.target === e.currentTarget) {
          cancelLogout();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        className="logout-confirm-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logout Warning Icon */}
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
          id="logout-dialog-title"
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '8px',
            letterSpacing: '-0.01em'
          }}
        >
          Are you sure you want to log out?
        </h2>

        {/* Contextual Description */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            marginBottom: '26px'
          }}
        >
          {isAuthority
            ? `You are signed in as ${user?.name || 'Municipal Officer'} (${user?.designation || 'Authority'}). You will need to sign in again to access the Executive Authority Dashboard.`
            : `You are signed in as ${user?.name || 'Citizen'}. You will need to sign in again to report civic issues.`}
        </p>

        {/* Modal Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            type="button"
            onClick={cancelLogout}
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
            Cancel
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
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
