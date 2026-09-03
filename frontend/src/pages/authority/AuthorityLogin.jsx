import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';
import authorityBg from '../../assets/authority-login-bg.jpg';

export default function AuthorityLogin() {
  const [email, setEmail] = useState('authority@crp.gov.in');
  const [password, setPassword] = useState('Authority@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
        navigate('/authority/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
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
            <input
              id="authorityPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? 'Verifying Authorization...' : 'Sign In to Authority Portal'}
          </button>
        </form>

        {/* Test / Evaluation Accounts Box */}
        <div style={{ marginTop: '28px', padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '0.8125rem', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Pre-configured Test Authority Accounts:
          </div>
          <div>
            • <strong>PWD Zonal Officer:</strong> <code>authority@crp.gov.in</code> / <code>Authority@123</code>
          </div>
          <div style={{ marginTop: '3px' }}>
            • <strong>Sanitation Inspector:</strong> <code>sanitation.officer@crp.gov.in</code> / <code>Authority@123</code>
          </div>
        </div>

        {/* Return to Citizen Site */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/home" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span>Looking for citizen grievance reporting? Return to Citizen Portal</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  </div>
);
}