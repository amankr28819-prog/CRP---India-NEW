import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import AuthTransition from '../../components/AuthTransition';
import authorityBg from '../../assets/authority-login-bg.jpg';

export default function AuthorityLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your municipal officer email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await login(email, password, 'authority');
      if (res.success) {
        setIsTransitioning(true);
        setTimeout(() => {
          navigate('/authority/dashboard', { replace: true });
        }, 1200);
        return;
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  return (
    <div
      className="authority-login-wrapper"
      style={{
        minHeight: 'calc(100vh - 70px)',
        backgroundImage: `
          linear-gradient(
            rgba(8, 16, 32, 0.72),
            rgba(8, 16, 32, 0.78)
          ),
          url(${authorityBg})
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '44px 16px 64px 16px'
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <BackButton fallback="/" style={{ color: '#FFFFFF', marginBottom: '16px' }} />
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '36px 32px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
        {/* Civic Authority Badge */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto'
            }}
          >
            <Building2 size={26} />
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Municipal Authority Portal
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Officer Sign In • Complaint Management & Resolution System
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="authorityEmail">
              Official Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="authorityEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@crp.gov.in"
                className="form-input"
                required
              />
            </div>
            <div className="form-hint">Must be registered with civic authority domain.</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="authorityPassword">
              Portal Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="authorityPassword"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingRight: '44px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                onMouseDown={(e) => e.preventDefault()}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  padding: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-muted, #94a3b8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  lineHeight: 1
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isTransitioning}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '10px' }}
          >
            {isTransitioning ? 'Signing In...' : loading ? 'Verifying Authorization...' : 'Sign In to Authority Portal'}
          </button>
        </form>

        {/* Return to Citizen Site */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/home" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span>Looking for citizen grievance reporting? Return to Citizen Portal</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>

    <AuthTransition
      isOpen={isTransitioning}
      title="Signing In..."
      redirectText="Redirecting to Municipal Authority Dashboard..."
      type="authority"
    />
  </div>
);
}