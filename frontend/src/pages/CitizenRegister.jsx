import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import AuthTransition from '../components/AuthTransition';
import loginBg from '../assets/citizen-login-bg.jpg';

export default function CitizenRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    voterId: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { register, isAuthenticated, isAuthority } = useAuth();
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

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.voterId) {
      setError('Please fill in all required fields including Voter ID.');
      return;
    }
    const cleanVoterId = formData.voterId.trim().toUpperCase();
    if (cleanVoterId.length !== 10 || !/^[A-Z0-9]{10}$/.test(cleanVoterId)) {
      setError('Voter ID must be a 10-digit alphanumeric code (e.g. ABC1234567).');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!agreedToTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy to register.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await register({ ...formData, voterId: cleanVoterId, agreedToTerms });
      if (res.success) {
        isRedirectingRef.current = true;
        setIsTransitioning(true);
        setTimeout(() => {
          navigate(redirectTarget, { replace: true });
        }, 1300);
        return;
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <BackButton fallback="/login" style={{ color: '#FFFFFF', marginBottom: '16px' }} />
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
          <div style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <UserPlus size={22} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Register Citizen Account
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Create an account to track all your civic grievances in one place
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
            <label className="form-label" htmlFor="regName">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="regName"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Amit Kumar"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="regEmail">
              Email Address <span className="required">*</span>
            </label>
            <input
              id="regEmail"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g. amit@example.com"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="regPhone">Phone Number</label>
            <input
              id="regPhone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g. +91 98765 43210"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="regVoterId">
              Voter ID (EPIC Number) <span className="required">*</span>
            </label>
            <input
              id="regVoterId"
              type="text"
              name="voterId"
              value={formData.voterId}
              onChange={(e) => setFormData(prev => ({ ...prev, voterId: e.target.value.toUpperCase() }))}
              placeholder="e.g. ABC1234567"
              className="form-input"
              maxLength={10}
              style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              10-digit alphanumeric code for official citizen verification
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="regPassword">
              Password <span className="required">*</span>
            </label>
            <input
              id="regPassword"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="At least 6 characters"
              className="form-input"
              required
            />
          </div>

          {/* Mandatory Terms & Conditions / Privacy Policy Checkbox */}
          <div style={{ marginTop: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <input
                id="regAgreeCheckbox"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (e.target.checked && error.includes('Terms & Conditions')) {
                    setError('');
                  }
                }}
                style={{
                  marginTop: '3px',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--color-primary)',
                  flexShrink: 0
                }}
              />
              <label
                htmlFor="regAgreeCheckbox"
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.5,
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                I agree to the{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 600 }}
                >
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 600 }}
                >
                  Privacy Policy
                </Link>.
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isTransitioning || !agreedToTerms}
            className="btn btn-primary btn-lg"
            style={{
              width: '100%',
              marginTop: '8px',
              opacity: (!agreedToTerms || loading || isTransitioning) ? 0.6 : 1,
              cursor: (!agreedToTerms || loading || isTransitioning) ? 'not-allowed' : 'pointer'
            }}
          >
            {isTransitioning ? 'Registering...' : loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            state={{ from: redirectTarget, message: redirectMessage }}
            style={{ color: 'var(--color-primary)', fontWeight: 600 }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>

    <AuthTransition
      isOpen={isTransitioning}
      title="Registration Successful"
      subtitle="Signing You In..."
      redirectText="Redirecting to Citizen Portal..."
      type="register"
    />
  </div>
);
}