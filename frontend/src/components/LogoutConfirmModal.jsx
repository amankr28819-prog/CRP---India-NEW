import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LogoutConfirmModal() {
  const navigate = useNavigate();
  const { showLogoutModal, cancelLogout, confirmLogout, user, isAuthority } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showLogoutModal) {
        cancelLogout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutModal, cancelLogout]);

  if (!showLogoutModal) return null;

  const handleConfirm = () => {
    confirmLogout();
    navigate('/');
    showToast({
      title: 'Logout Successful',
      message: 'You have been safely signed out.',
      type: 'success',
      duration: 3500
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
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
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          maxWidth: '440px',
          width: '100%',
          padding: '28px 24px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.35)',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logout Warning Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: 'var(--color-status-rejected)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
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
            marginBottom: '8px'
          }}
        >
          Are you sure you want to log out?
        </h2>

        {/* Contextual Description */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: '24px'
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
              width: '100%'
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
              backgroundColor: 'var(--color-status-rejected)',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 16px',
              fontWeight: 600,
              borderRadius: '6px',
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
