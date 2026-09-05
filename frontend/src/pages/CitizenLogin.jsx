import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, AlertCircle, Building2, ArrowRight, Info, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import AuthTransition from '../components/AuthTransition';
import loginBg from '../assets/citizen-login-bg.jpg';

export default function CitizenLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { login, isAuthenticated, isAuthority } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRedirectingRef = React.useRef(false);

  const rawFrom = location.state?.from?.pathname || location.state?.from;
  const redirectTarget = (rawFrom && rawFrom !== '/' && rawFrom !== '/select-role') ? rawFrom : '/home';
  const redirectMessage = location.state?.message;

  React.useEffect(() => {
    if (isAuthenticated && !isAuthority && !isRedirectingRef.current) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, isAuthority, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await login(email, password, 'citizen');
      if (res.success) {
        isRedirectingRef.current = true;
        setIsTransitioning(true);
        setTimeout(() => {
          navigate(redirectTarget, { replace: true });
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
      className="citizen-login-wrapper"
      style={{
        minHeight: 'calc(100vh - 70px)',
        backgroundImage: `
          linear-gradient(
            rgba(7, 16, 34, 0.72),
            rgba(7, 16, 34, 0.78)
          ),
          url(${loginBg})
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
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <BackButton
          fallback="/"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            color: '#F8FAFC',
            borderColor: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            marginBottom: '16px'
          }}
        />
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
              <User size={22} />
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Citizen Sign In
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Access your filed grievances and track updates
            </p>
          </div>

          {redirectMessage && !error && (
            <div className="alert alert-info" style={{ marginBottom: '20px', backgroundColor: 'var(--color-accent-blue-bg)', borderColor: 'var(--color-primary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.875rem' }}>{redirectMessage}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="citizenEmail">
                Email Address <span style={{ color: 'var(--color-accent-urgent)' }}>*</span>
              </label>
              <input
                id="citizenEmail"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. citizen@example.com"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="citizenPassword">
                Password <span style={{ color: 'var(--color-accent-urgent)' }}>*</span>
              </label>
              <input
                id="citizenPassword"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || isTransitioning}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {isTransitioning ? 'Signing In...' : loading ? 'Authenticating...' : 'Sign In as Citizen'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              state={{ from: redirectTarget, message: redirectMessage }}
              style={{ color: 'var(--color-primary)', fontWeight: 600 }}
            >
              Register here
            </Link>
          </div>

          {/* Municipal Authority Portal Switch */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <Link to="/authority/login" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} />
              <span>Municipal Officer? Access Authority Portal</span>
            </Link>
          </div>
        </div>
      </div>

      <AuthTransition
        isOpen={isTransitioning}
        title="Signing In..."
        redirectText="Redirecting to Citizen Portal..."
        type="login"
      />
    </div>
  );
}