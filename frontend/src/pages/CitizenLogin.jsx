import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, AlertCircle, Building2, ArrowRight, Info, ShieldCheck, Eye, EyeOff, KeyRound, CheckCircle2, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import BackButton from '../components/BackButton';
import AuthTransition from '../components/AuthTransition';
import loginBg from '../assets/citizen-login-bg.jpg';

export default function CitizenLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

      <AuthTransition
        isOpen={isTransitioning}
        title="Signing In..."
        redirectText="Redirecting to Citizen Portal..."
        type="login"
      />
    </div>
  );
}