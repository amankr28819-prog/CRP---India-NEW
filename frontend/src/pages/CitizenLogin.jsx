import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, AlertCircle, Building2, ArrowRight, Info, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BackButton from '../components/BackButton';
import loginBg from '../assets/citizen-login-bg.jpg';

export default function CitizenLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [voterId, setVoterId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isAuthority } = useAuth();
  const { showToast } = useToast();
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
    if (!email || !password || !voterId) {
      setError('Please enter your email address, password, and 10-digit Voter ID.');
      return;
    }

    const cleanVoterId = voterId.trim().toUpperCase();
    if (cleanVoterId.length !== 10 || !/^[A-Z0-9]{10}$/.test(cleanVoterId)) {
      setError('Voter ID must be a 10-digit alphanumeric code (e.g. ABC1234567).');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await login(email, password, 'citizen', cleanVoterId);
      if (res.success) {
        isRedirectingRef.current = true;
        showToast({
          title: 'Login Successful',
          message: 'Welcome back! Redirecting to your Citizen Portal...',
          type: 'success',
          duration: 3500
        });
        setTimeout(() => {
          navigate(redirectTarget, { replace: true });
        }, 850);
        return;
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  return (
    <div
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
        <BackButton fallback="/" style={{ color: '#FFFFFF', marginBottom: '16px' }} />
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
                type="email"
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="citizenVoterId">
                Voter ID (EPIC Number) <span style={{ color: 'var(--color-accent-urgent)' }}>*</span>
              </label>
              <input
                id="citizenVoterId"
                type="text"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                placeholder="e.g. ABC1234567"
                className="form-input"
                maxLength={10}
                style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                10-digit alphanumeric code
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? 'Authenticating...' : 'Sign In as Citizen'}
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

          {/* Demo Credentials Tip */}
          <div
            style={{
              marginTop: '24px',
              padding: '14px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Demo Citizen Login:</strong>
              <button
                type="button"
                onClick={() => {
                  setEmail('citizen@example.com');
                  setPassword('Citizen@123');
                  setVoterId('ABC1234567');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Auto-fill
              </button>
            </div>
            <div>Email: <code>citizen@example.com</code></div>
            <div>Password: <code>Citizen@123</code></div>
            <div>Voter ID: <code>ABC1234567</code></div>
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
    </div>
  );
}