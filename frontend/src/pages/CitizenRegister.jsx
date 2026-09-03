import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';

export default function CitizenRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || location.state?.from || '/';
  const redirectMessage = location.state?.message;

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
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
      const res = await register({ ...formData, agreedToTerms });
      if (res.success) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '48px 20px 80px 20px', maxWidth: '480px' }}>
      <BackButton fallback="/login" />
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '32px' }}>
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
            state={{ from, message: redirectMessage }}
            style={{ color: 'var(--color-primary)', fontWeight: 600 }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}