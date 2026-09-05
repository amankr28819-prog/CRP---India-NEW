import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ fallback = '/', label = 'Back', style = {}, className = '', onClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }

    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      const isAuthorityRoute = location.pathname.startsWith('/authority');
      const safeFallback = fallback || (isAuthorityRoute ? '/authority/dashboard' : '/');
      navigate(safeFallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`btn btn-secondary btn-sm ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '18px',
        cursor: 'pointer',
        fontSize: '0.8125rem',
        fontWeight: 500,
        fontFamily: 'var(--font-family, inherit)',
        lineHeight: 1.2,
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-primary)',
        ...style
      }}
      aria-label="Back to previous page"
    >
      <ArrowLeft size={15} />
      <span>{label}</span>
    </button>
  );
}
