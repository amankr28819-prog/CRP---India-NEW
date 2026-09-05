import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, AlertCircle, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    const hasUpper = /[A-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
    if (!hasUpper || !hasNumber || !hasSpecial) {
      setError('Password must be at least 8 characters and contain at least 1 uppercase letter, 1 number, and 1 special character.');
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
        setLoading(false);
        setShowSuccessModal(true);
        // Clear password from local form state for credential safety
        setFormData(prev => ({ ...prev, password: '' }));
        return;
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  // Auto-redirect to login after 2.5 seconds if user does not click manually
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            from: redirectTarget,
            message: 'Registration successful. Please login with your new account.'
          }
        });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, navigate, redirectTarget]);

  return (
    <div
      className="citizen-register-wrapper"
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
        <BackButton
          fallback="/login"
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
              autoComplete="name"
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
              autoComplete="username"
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
              autoComplete="tel"
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
              autoComplete="new-password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="At least 8 characters"
              className="form-input"
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Password must be at least 8 characters and contain at least 1 uppercase letter, 1 number, and 1 special character.
            </span>
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
            disabled={loading || !agreedToTerms}
            className="btn btn-primary btn-lg"
            style={{
              width: '100%',
              marginTop: '8px',
              opacity: (!agreedToTerms || loading) ? 0.6 : 1,
              cursor: (!agreedToTerms || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
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

    {/* Registration Success Modal */}
    {showSuccessModal && (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '32px 28px',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-accent-green-bg, #DCFCE7)',
              color: 'var(--color-accent-green, #15803D)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Account Created Successfully
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
            Registration successful. Please login with your new account.
          </p>

          <button
            type="button"
            onClick={() => {
              navigate('/login', {
                replace: true,
                state: {
                  from: redirectTarget,
                  message: 'Registration successful. Please login with your new account.'
                }
              });
            }}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>Proceed to Citizen Login</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    )}
  </div>
);
}