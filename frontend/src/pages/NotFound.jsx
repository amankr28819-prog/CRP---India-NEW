import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home, Shield } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px'
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}
        >
          <FileQuestion size={32} />
        </div>

        <span
          style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '3px 10px',
            borderRadius: '9999px',
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-muted)',
            marginBottom: '12px'
          }}
        >
          Error 404
        </span>

        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 10px 0',
            letterSpacing: '-0.02em'
          }}
        >
          Page Not Found
        </h1>

        <p
          style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: '0 0 28px 0'
          }}
        >
          The page you requested could not be found or may have been relocated within the Civic Reporting Platform.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            to="/home"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontWeight: 600,
              textDecoration: 'none',
              borderRadius: '8px'
            }}
          >
            <Home size={18} />
            <span>Go to Citizen</span>
          </Link>

          <Link
            to="/authority/dashboard"
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              fontWeight: 600,
              textDecoration: 'none',
              borderRadius: '8px'
            }}
          >
            <Shield size={18} />
            <span>Go to Municipal Authority Portal</span>
          </Link>

          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              marginTop: '8px',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Role Selection Gateway</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
