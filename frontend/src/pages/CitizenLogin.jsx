import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, AlertCircle, Building2, ArrowRight, Info, ShieldCheck, Eye, EyeOff, KeyRound, CheckCircle2, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import BackButton from '../components/BackButton';
import AuthTransition from '../components/AuthTransition';
import loginBg from '../assets/background.png';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export default function CitizenLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Google Sign-In State
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pendingGoogleCredential, setPendingGoogleCredential] = useState('');

  // Account Linking Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [showLinkPassword, setShowLinkPassword] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);

  // New Citizen Onboarding Modal State
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardName, setOnboardName] = useState('');
  const [onboardPhone, setOnboardPhone] = useState('');
  const [onboardVoterId, setOnboardVoterId] = useState('');
  const [onboardError, setOnboardError] = useState('');
  const [onboardLoading, setOnboardLoading] = useState(false);

  // Password Reset Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Verify, 2: New Password, 3: Success
  const [resetEmail, setResetEmail] = useState('');
  const [resetPhone, setResetPhone] = useState('');
  const [resetVoterId, setResetVoterId] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const { login, setSession, isAuthenticated, isAuthority } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRedirectingRef = useRef(false);

  const rawFrom = location.state?.from?.pathname || location.state?.from;
  const redirectTarget = (rawFrom && rawFrom !== '/' && rawFrom !== '/select-role') ? rawFrom : '/home';
  const redirectMessage = location.state?.message;

  // Initialize Google Identity Services
  useEffect(() => {
    let isMounted = true;

    const setupGoogle = async () => {
      let clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        try {
          const configRes = await api.getGoogleConfig();
          if (configRes && configRes.clientId) {
            clientId = configRes.clientId;
          }
        } catch {
          // ignore
        }
      }

      if (!isMounted) return;
      if (clientId) setGoogleClientId(clientId);

      const renderGIS = () => {
        if (!window.google?.accounts?.id || !clientId) return;
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            cancel_on_tap_outside: true
          });

          const btnContainer = document.getElementById('googleSignInBtnDiv');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const containerWidth = btnContainer.offsetWidth || 396;
            const btnWidth = Math.min(Math.max(containerWidth, 200), 400);
            window.google.accounts.id.renderButton(btnContainer, {
              type: 'standard',
              theme: isDark ? 'filled_black' : 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: btnWidth
            });
            setGoogleLoaded(true);
          }
        } catch (e) {
          console.warn('[GIS] Error initializing Google Sign-In:', e);
        }
      };

      if (window.google?.accounts?.id) {
        renderGIS();
      } else {
        const interval = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(interval);
            renderGIS();
          }
        }, 300);
        setTimeout(() => clearInterval(interval), 5000);
      }
    };

    setupGoogle();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (isAuthenticated && !isAuthority && !isRedirectingRef.current) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, isAuthority, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter both your email address or mobile number and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await login(identifier.trim(), password, 'citizen');
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

  // Handle response from Google Identity Services
  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) {
      setError('No credential received from Google authentication.');
      return;
    }

    setGoogleLoading(true);
    setError('');
    const credential = response.credential;
    setPendingGoogleCredential(credential);

    try {
      const res = await api.googleAuth(credential);

      if (res.requiresLinking) {
        setLinkEmail(res.email);
        setLinkPassword('');
        setLinkError('');
        setShowLinkModal(true);
        setGoogleLoading(false);
        return;
      }

      if (res.requiresOnboarding) {
        setOnboardEmail(res.email);
        setOnboardName(res.name || '');
        setOnboardPhone('');
        setOnboardVoterId('');
        setOnboardError('');
        setShowOnboardModal(true);
        setGoogleLoading(false);
        return;
      }

      if (res.success && res.token) {
        setSession(res.token, res.user);
        isRedirectingRef.current = true;
        setIsTransitioning(true);
        setTimeout(() => {
          navigate(redirectTarget, { replace: true });
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Google authentication failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignInClick = () => {
    if (!googleClientId) {
      setError('Google Sign-In is being configured for CRP India. (GOOGLE_CLIENT_ID environment variable not set).');
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          setError('Google Sign-In could not be displayed. Please check popup permissions.');
        }
      });
    } else {
      setError('Google authentication service is initializing. Please wait a moment.');
    }
  };

  const handleConfirmLink = async (e) => {
    e.preventDefault();
    if (!linkPassword) {
      setLinkError('Please enter your existing CRP password to verify account ownership.');
      return;
    }

    setLinkLoading(true);
    setLinkError('');

    try {
      const res = await api.googleLink(pendingGoogleCredential, linkPassword);
      if (res.success && res.token) {
        setShowLinkModal(false);
        setSession(res.token, res.user);
        isRedirectingRef.current = true;
        setIsTransitioning(true);
        setTimeout(() => {
          navigate(redirectTarget, { replace: true });
        }, 1200);
      }
    } catch (err) {
      setLinkError(err.message || 'Incorrect password. Account verification failed.');
      setLinkLoading(false);
    }
  };

  const handleConfirmOnboard = async (e) => {
    e.preventDefault();
    setOnboardError('');

    const cleanVoter = onboardVoterId.trim().toUpperCase();
    if (!/^[A-Z0-9]{10}$/.test(cleanVoter)) {
      setOnboardError('Voter ID must be a valid 10-digit alphanumeric code (e.g. ABC1234567).');
      return;
    }

    const cleanPhone = onboardPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setOnboardError('Mobile number must be exactly 10 digits.');
      return;
    }
    if (!['6', '7', '8', '9'].includes(cleanPhone[0])) {
      setOnboardError('Mobile number must begin with 6, 7, 8, or 9.');
      return;
    }

    setOnboardLoading(true);
    try {
      const res = await api.googleOnboard({
        credential: pendingGoogleCredential,
        voterId: cleanVoter,
        phone: `+91${cleanPhone}`,
        name: onboardName.trim()
      });

      if (res.success && res.token) {
        setShowOnboardModal(false);
        setSession(res.token, res.user);
        isRedirectingRef.current = true;
        setIsTransitioning(true);
        setTimeout(() => {
          navigate(redirectTarget, { replace: true });
        }, 1200);
      }
    } catch (err) {
      setOnboardError(err.message || 'Onboarding failed. Please check your details.');
      setOnboardLoading(false);
    }
  };

  const handleOpenResetModal = () => {
    setResetStep(1);
    setResetEmail(identifier.includes('@') ? identifier.trim() : '');
    setResetPhone(!identifier.includes('@') && /^\d+$/.test(identifier.trim()) ? identifier.trim() : '');
    setResetVoterId('');
    setResetToken('');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetError('');
    setShowResetModal(true);
  };

  const handleCloseResetModal = () => {
    setShowResetModal(false);
    setResetError('');
    setResetLoading(false);
  };

  const handleVerifyReset = async (e) => {
    e.preventDefault();
    setResetError('');

    if (!resetEmail.trim() || !resetPhone.trim() || !resetVoterId.trim()) {
      setResetError('Please provide Email, Mobile Number, and Voter ID.');
      return;
    }

    const cleanPhone = resetPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setResetError('Mobile number must be exactly 10 digits.');
      return;
    }
    if (!['6', '7', '8', '9'].includes(cleanPhone[0])) {
      setResetError('Mobile number must begin with 6, 7, 8, or 9.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await api.verifyResetCredentials(
        resetEmail.trim(),
        `+91${cleanPhone}`,
        resetVoterId.trim().toUpperCase()
      );
      if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        setResetStep(2);
      }
    } catch (err) {
      setResetError(err.message || 'Verification failed. Please check your credentials.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setResetError('');

    if (!newPassword || !confirmNewPassword) {
      setResetError('Please enter and confirm your new password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters long.');
      return;
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasUpper || !hasNumber || !hasSpecial) {
      setResetError('Password must be at least 8 characters and contain at least 1 uppercase letter, 1 number, and 1 special character.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await api.confirmPasswordReset(resetToken, newPassword, confirmNewPassword);
      if (res.success) {
        setResetStep(3);
      }
    } catch (err) {
      setResetError(err.message || 'Failed to reset password. Please restart the verification process.');
    } finally {
      setResetLoading(false);
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
              <label className="form-label" htmlFor="citizenIdentifier">
                Email or Mobile Number <span style={{ color: 'var(--color-accent-urgent)' }}>*</span>
              </label>
              <input
                id="citizenIdentifier"
                name="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or mobile number"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="citizenPassword">
                Password <span style={{ color: 'var(--color-accent-urgent)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="citizenPassword"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={handleOpenResetModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '2px 0'
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isTransitioning || googleLoading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', minHeight: '48px', marginTop: '6px' }}
            >
              {isTransitioning ? 'Signing In...' : loading ? 'Authenticating...' : 'Sign In as Citizen'}
            </button>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '18px 0',
                gap: '12px'
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Or continue with
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            </div>

            {/* Google Sign-In for Citizens Only */}
            <div style={{ width: '100%' }}>
              <div
                id="googleSignInBtnDiv"
                style={{
                  display: googleLoaded ? 'flex' : 'none',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  minHeight: '48px'
                }}
              ></div>

              {!googleLoaded && (
                <button
                  type="button"
                  onClick={handleGoogleSignInClick}
                  disabled={googleLoading || loading || isTransitioning}
                  className="btn btn-secondary btn-lg"
                  style={{
                    width: '100%',
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md, 8px)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-family)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                    cursor: googleLoading || loading || isTransitioning ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!googleLoading && !loading && !isTransitioning) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  {googleLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span>{googleLoading ? 'Verifying with Google...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
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

      {/* Password Reset Modal (Citizen Only) */}
      {showResetModal && (
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
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={handleCloseResetModal}
              title="Close modal"
              aria-label="Close modal"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px'
              }}
            >
              <X size={20} />
            </button>

            {resetStep === 1 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                    <KeyRound size={22} />
                  </div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Reset Citizen Password
                  </h2>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Verify your identity using your registered credentials
                  </p>
                </div>

                {resetError && (
                  <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '0.825rem' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{resetError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyReset}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="resetEmail">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="citizen@example.com"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="resetPhone">
                      Mobile Number <span className="required">*</span>
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 12px',
                          backgroundColor: 'var(--bg-subtle)',
                          borderRight: '1px solid var(--border-subtle)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          userSelect: 'none',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span>+91</span>
                        <span style={{ color: 'var(--border-subtle)', fontWeight: 300 }}>|</span>
                      </div>
                      <input
                        id="resetPhone"
                        type="tel"
                        value={resetPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setResetPhone(val);
                        }}
                        placeholder="9876543210"
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          padding: '10px 14px',
                          backgroundColor: 'transparent',
                          color: 'var(--text-primary)',
                          fontSize: '0.9375rem',
                          width: '100%'
                        }}
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="resetVoterId">
                      Actual Voter ID (EPIC Number) <span className="required">*</span>
                    </label>
                    <input
                      id="resetVoterId"
                      type="text"
                      value={resetVoterId}
                      onChange={(e) => setResetVoterId(e.target.value.toUpperCase())}
                      placeholder="ABC1234567"
                      className="form-input"
                      maxLength={10}
                      style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }}
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Verifying Identity...</span>
                      </>
                    ) : (
                      <span>Verify Identity</span>
                    )}
                  </button>
                </form>
              </>
            )}

            {resetStep === 2 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                    <ShieldCheck size={22} />
                  </div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Create New Password
                  </h2>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Identity verified. Set a strong password for your citizen account.
                  </p>
                </div>

                {resetError && (
                  <div className="alert alert-error" style={{ marginBottom: '16px', fontSize: '0.825rem' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{resetError}</span>
                  </div>
                )}

                <form onSubmit={handleConfirmReset}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="resetNewPassword">
                      New Password <span className="required">*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="resetNewPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="form-input"
                        style={{ paddingRight: '44px' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        title={showNewPassword ? 'Hide password' : 'Show password'}
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
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
                      Password must:
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '4px', marginTop: '4px' }}>
                        <span style={{ color: newPassword.length >= 8 ? 'var(--color-accent-green, #15803D)' : 'var(--text-muted)' }}>
                          {newPassword.length >= 8 ? '✓' : '•'} At least 8 characters
                        </span>
                        <span style={{ color: /[A-Z]/.test(newPassword) ? 'var(--color-accent-green, #15803D)' : 'var(--text-muted)' }}>
                          {/[A-Z]/.test(newPassword) ? '✓' : '•'} 1 uppercase letter
                        </span>
                        <span style={{ color: /[0-9]/.test(newPassword) ? 'var(--color-accent-green, #15803D)' : 'var(--text-muted)' }}>
                          {/[0-9]/.test(newPassword) ? '✓' : '•'} 1 number (0-9)
                        </span>
                        <span style={{ color: /[^A-Za-z0-9]/.test(newPassword) ? 'var(--color-accent-green, #15803D)' : 'var(--text-muted)' }}>
                          {/[^A-Za-z0-9]/.test(newPassword) ? '✓' : '•'} 1 special character
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="resetConfirmNewPassword">
                      Confirm New Password <span className="required">*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="resetConfirmNewPassword"
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="form-input"
                        style={{ paddingRight: '44px' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                        onMouseDown={(e) => e.preventDefault()}
                        aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                        title={showConfirmNewPassword ? 'Hide password' : 'Show password'}
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
                        {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }}
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving New Password...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </form>
              </>
            )}

            {resetStep === 3 && (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-accent-green-bg, #DCFCE7)',
                    color: 'var(--color-accent-green, #15803D)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Password Reset Successfully
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
                  Password reset successfully. You can now log in with your new password.
                </p>

                <button
                  type="button"
                  onClick={handleCloseResetModal}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Return to Citizen Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Google Account Linking Verification Modal */}
      {showLinkModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !linkLoading) {
              setShowLinkModal(false);
              setLinkError('');
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface-card, #ffffff)',
              border: '1px solid var(--border-default, #cbd5e1)',
              borderRadius: '12px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-subtle, #f8fafc)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary, #2563eb)'
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Verify & Link Account
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Existing Citizen Profile Detected
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!linkLoading) {
                    setShowLinkModal(false);
                    setLinkError('');
                  }
                }}
                disabled={linkLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmLink} style={{ padding: '24px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(37, 99, 235, 0.06)',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '18px',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  color: 'var(--text-secondary)'
                }}
              >
                An existing CRP citizen account is registered under{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{linkEmail}</strong>.
                To link your Google identity and protect your existing grievances and votes, please enter your existing CRP account password.
              </div>

              {linkError && (
                <div className="login-error-banner" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{linkError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="linkPassword">
                  Existing CRP Password <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="linkPassword"
                    type={showLinkPassword ? 'text' : 'password'}
                    value={linkPassword}
                    onChange={(e) => setLinkPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="form-input"
                    style={{ paddingRight: '44px' }}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowLinkPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      padding: '8px',
                      cursor: 'pointer',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {showLinkPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkModal(false);
                    setLinkError('');
                  }}
                  disabled={linkLoading}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkLoading}
                  className="btn btn-primary"
                  style={{ flex: 1.5, justifyContent: 'center' }}
                >
                  {linkLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Linking...</span>
                    </>
                  ) : (
                    <span>Verify & Link Google</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Citizen Onboarding Modal */}
      {showOnboardModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !onboardLoading) {
              setShowOnboardModal(false);
              setOnboardError('');
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface-card, #ffffff)',
              border: '1px solid var(--border-default, #cbd5e1)',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-subtle, #f8fafc)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-status-resolved, #16a34a)'
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Complete Citizen Registration
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Google Identity Verified
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!onboardLoading) {
                    setShowOnboardModal(false);
                    setOnboardError('');
                  }
                }}
                disabled={onboardLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmOnboard} style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-subtle, #f8fafc)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  border: '1px solid var(--border-subtle, #e2e8f0)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Google Email
                  </div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {onboardEmail}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: '#16a34a',
                    fontWeight: 600,
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}
                >
                  <CheckCircle2 size={13} />
                  <span>Verified</span>
                </div>
              </div>

              {onboardError && (
                <div className="login-error-banner" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{onboardError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="onboardName">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  id="onboardName"
                  type="text"
                  value={onboardName}
                  onChange={(e) => setOnboardName(e.target.value)}
                  placeholder="Official citizen name"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="onboardVoterId">
                  Voter ID (EPIC Number) <span className="required">*</span>
                </label>
                <input
                  id="onboardVoterId"
                  type="text"
                  value={onboardVoterId}
                  onChange={(e) => setOnboardVoterId(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC1234567"
                  className="form-input"
                  maxLength={10}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  Must be exactly 10 alphanumeric characters.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="onboardPhone">
                  Mobile Number <span className="required">*</span>
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--border-default, #cbd5e1)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--surface-card, #ffffff)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-subtle, #f8fafc)',
                      borderRight: '1px solid var(--border-subtle, #e2e8f0)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      userSelect: 'none'
                    }}
                  >
                    <span>+91</span>
                    <span style={{ color: 'var(--border-subtle)', fontWeight: 300 }}>|</span>
                  </div>
                  <input
                    id="onboardPhone"
                    type="tel"
                    value={onboardPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setOnboardPhone(val);
                    }}
                    placeholder="9876543210"
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      padding: '10px 14px',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '0.9375rem',
                      width: '100%'
                    }}
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowOnboardModal(false);
                    setOnboardError('');
                  }}
                  disabled={onboardLoading}
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={onboardLoading}
                  className="btn btn-primary"
                  style={{ flex: 1.6, justifyContent: 'center' }}
                >
                  {onboardLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <span>Register & Sign In</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuthTransition
        isOpen={isTransitioning}
        title="Signing In..."
        redirectText="Redirecting to Citizen Portal..."
        type="login"
      />
    </div>
  );
}