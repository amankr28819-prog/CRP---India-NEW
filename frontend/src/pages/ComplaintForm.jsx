import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  MapPin,
  Camera,
  X,
  UploadCloud,
  CheckCircle2,
  Copy,
  Search,
  ArrowLeft,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from './CategorySelect';
import BackButton from '../components/BackButton';

const SLUG_TO_NAME = {
  'roads-potholes': 'Roads & Potholes',
  'roads': 'Roads & Potholes',
  'garbage-sanitation': 'Garbage & Sanitation',
  'garbage': 'Garbage & Sanitation',
  'streetlights': 'Streetlights',
  'water-supply': 'Water Supply',
  'water': 'Water Supply',
  'drainage': 'Drainage',
  'public-spaces': 'Public Spaces',
  'other-issues': 'Other Issues',
  'other': 'Other Issues'
};

export default function ComplaintForm() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  const initialCategory = categorySlug ? SLUG_TO_NAME[categorySlug] || 'Roads & Potholes' : 'Roads & Potholes';

  const [formData, setFormData] = useState({
    category: initialCategory,
    title: '',
    description: '',
    location: '',
    ward: '',
    city: 'Bengaluru',
    latitude: '',
    longitude: '',
    citizenName: user ? user.name : '',
    citizenPhone: user ? user.phone : '',
    citizenEmail: user ? user.email : ''
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedRef, setSubmittedRef] = useState(null);
  const [copied, setCopied] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Check if citizen entered any data into the form
  const isFormDirty = Boolean(
    formData.title.trim() ||
    formData.description.trim() ||
    formData.location.trim() ||
    formData.ward.trim() ||
    selectedImages.length > 0 ||
    formData.latitude ||
    formData.longitude
  );

  // Prevent accidental loss on page refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormDirty && !submittedRef) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty, submittedRef]);

  // Handle ESC key to dismiss confirmation modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showLeaveModal) {
        setShowLeaveModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLeaveModal]);

  const executeBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/report');
    }
  };

  const handleBack = () => {
    if (isFormDirty && !submittedRef) {
      setShowLeaveModal(true);
      return;
    }
    executeBack();
  };

  useEffect(() => {
    if (categorySlug && SLUG_TO_NAME[categorySlug]) {
      setFormData(prev => ({ ...prev, category: SLUG_TO_NAME[categorySlug] }));
    }
  }, [categorySlug]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', {
        state: {
          from: location,
          message: 'Please log in or register to report a civic issue.'
        },
        replace: true
      });
    }
  }, [isAuthenticated, loading, navigate, location]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        citizenName: user.name || '',
        citizenPhone: user.phone || '',
        citizenEmail: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if ((name === 'latitude' || name === 'longitude') && errors.gps) {
      setErrors(prev => ({ ...prev, gps: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate size (max 5MB each)
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    if (validFiles.length < files.length) {
      alert('Some images exceed the 5MB size limit and were skipped.');
    }

    const totalFiles = [...selectedImages, ...validFiles].slice(0, 3);
    setSelectedImages(totalFiles);

    // Create image previews
    const newPreviews = totalFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index) => {
    const updatedFiles = selectedImages.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(updatedFiles);
    setImagePreviews(updatedPreviews);
  };

  const fetchGeolocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
        setErrors(prev => ({ ...prev, gps: '' }));
        setGpsLoading(false);
      },
      (error) => {
        setGpsLoading(false);
        setGpsError('Unable to retrieve coordinates. Please enter your coordinates manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Complaint title is required.';
    if (!formData.description.trim()) errs.description = 'Please provide detailed description.';
    
    // 1. Manual Location validation
    if (!formData.location || !formData.location.trim()) {
      errs.location = 'Location is required.';
    }

    if (!formData.ward || !formData.ward.trim()) errs.ward = 'Ward identifier is required.';
    if (!formData.city || !formData.city.trim()) errs.city = 'City name is required.';

    // 2. GPS Location validation
    const latStr = formData.latitude !== null && formData.latitude !== undefined ? String(formData.latitude).trim() : '';
    const lngStr = formData.longitude !== null && formData.longitude !== undefined ? String(formData.longitude).trim() : '';

    if (!latStr || !lngStr) {
      errs.gps = 'GPS location is required. Please enter your coordinates or use your current device GPS.';
    } else {
      const numLat = Number(latStr);
      const numLng = Number(lngStr);
      if (isNaN(numLat) || numLat < -90 || numLat > 90) {
        errs.gps = 'Invalid latitude. Latitude must be a number between -90 and 90.';
      } else if (isNaN(numLng) || numLng < -180 || numLng > 180) {
        errs.gps = 'Invalid longitude. Longitude must be a number between -180 and 180.';
      }
    }

    // 3. Citizen Contact Details validation (mandatory from registered account)
    const currentName = (user?.name || formData.citizenName || '').trim();
    const currentPhone = (user?.phone || formData.citizenPhone || '').trim();
    const currentEmail = (user?.email || formData.citizenEmail || '').trim();

    if (!currentName) {
      errs.citizenName = 'Full Name is missing from your registered account. Please update your account profile.';
    }
    if (!currentPhone) {
      errs.citizenPhone = 'Phone Number is missing from your registered account. Please update your account profile.';
    }
    if (!currentEmail) {
      errs.citizenEmail = 'Email Address is missing from your registered account. Please update your account profile.';
    }

    if (!agreedToTerms) {
      errs.agreedToTerms = 'Please agree to the Privacy Policy and Terms of Service before submitting your complaint.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const data = new FormData();
      data.append('category', formData.category);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('location', formData.location);
      data.append('ward', formData.ward);
      data.append('city', formData.city);
      if (formData.latitude) data.append('latitude', formData.latitude);
      if (formData.longitude) data.append('longitude', formData.longitude);
      data.append('citizenName', formData.citizenName);
      data.append('citizenPhone', formData.citizenPhone);
      data.append('citizenEmail', formData.citizenEmail);
      data.append('agreedToTerms', agreedToTerms);

      selectedImages.forEach(file => {
        data.append('images', file);
      });

      const res = await api.submitComplaint(data);
      if (res.success && res.referenceId) {
        setSubmittedRef(res.referenceId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setSubmitError(err.message || 'Unable to submit grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRefToClipboard = () => {
    if (submittedRef) {
      navigator.clipboard.writeText(submittedRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Render Success Screen after Submission
  if (submittedRef) {
    return (
      <div className="container" style={{ padding: '48px 20px 80px 20px', maxWidth: '640px' }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '36px 28px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--color-accent-green-bg)', color: 'var(--color-accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <CheckCircle2 size={32} />
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Complaint submitted successfully
          </h1>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.5 }}>
            Your grievance has been officially registered and queued for municipal division assessment. Please keep this Reference ID safely to track live updates.
          </p>

          {/* Reference ID Banner */}
          <div style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '18px', marginBottom: '28px' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
              Complaint Reference ID
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.04em', margin: '6px 0 10px 0' }}>
              {submittedRef}
            </div>
            <button
              type="button"
              onClick={copyRefToClipboard}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8125rem' }}
            >
              <Copy size={14} />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Reference ID'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to={`/track?ref=${encodeURIComponent(submittedRef)}`} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              <Search size={18} />
              <span>Track Complaint Status Now</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setSubmittedRef(null);
                setFormData(prev => ({
                  ...prev,
                  title: '',
                  description: '',
                  location: '',
                  ward: ''
                }));
                setSelectedImages([]);
                setImagePreviews([]);
              }}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Report Another Problem
            </button>

            <Link to="/" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Return to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 20px 64px 20px', maxWidth: '800px' }}>
      <BackButton onClick={handleBack} />

      {/* Leave Confirmation Modal */}
      {showLeaveModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            backdropFilter: 'blur(2px)'
          }}
          onClick={() => setShowLeaveModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-leave-title"
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '28px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-accent-amber-bg)',
                  color: 'var(--color-accent-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <h3
                id="modal-leave-title"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: 0
                }}
              >
                Leave without submitting?
              </h3>
            </div>

            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                marginBottom: '24px'
              }}
            >
              You have entered details in your complaint form. If you go back now, your entered information will not be saved.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '8px 16px' }}
              >
                Stay on Page
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLeaveModal(false);
                  executeBack();
                }}
                className="btn btn-primary btn-sm btn-report-accent"
                style={{ padding: '8px 16px' }}
              >
                Leave Page
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header" style={{ marginBottom: '24px', paddingTop: '4px' }}>
        <h1 className="page-title">Report an Issue</h1>
        <p className="page-subtitle">
          Provide the details of the problem so the municipal team can fix it.
        </p>
      </div>

      {submitError && (
        <div className="alert alert-error">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '28px' }}>
        {/* Category Field */}
        <div className="form-group">
          <label className="form-label">
            Complaint Category <span className="required">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="form-select"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.slug} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <div className="form-hint">This issue will be sent to the responsible department.</div>
        </div>

        {/* Complaint Title */}
        <div className="form-group">
          <label className="form-label">
            Complaint Title <span className="required">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g. Deep pothole causing skidding hazard near Main Market bus stand"
            className="form-input"
            maxLength={150}
          />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>

        {/* Detailed Description */}
        <div className="form-group">
          <label className="form-label">
            Detailed Description <span className="required">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Provide specific details: duration of problem, dimensions, severity, impact on traffic or pedestrians..."
            className="form-textarea"
          />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>

        {/* Location & Jurisdiction Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="complaintLocation">
              Location <span className="required">*</span>
            </label>
            <input
              id="complaintLocation"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g. Opposite Pillar 142, Outer Ring Road"
              className={`form-input ${errors.location ? 'input-error' : ''}`}
              required
            />
            {errors.location && (
              <div className="form-error" style={{ color: 'var(--color-status-rejected)', fontSize: '0.8125rem', marginTop: '4px' }}>
                {errors.location}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Ward Number / Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="ward"
              value={formData.ward}
              onChange={handleInputChange}
              placeholder="e.g. Ward 14 (Indiranagar)"
              className="form-input"
            />
            {errors.ward && <div className="form-error">{errors.ward}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              City <span className="required">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="e.g. Bengaluru, Pune, Delhi..."
              className="form-input"
            />
            {errors.city && <div className="form-error">{errors.city}</div>}
          </div>
        </div>

        {/* Required GPS Location */}
        <div className="form-group" style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: '6px', border: errors.gps ? '1px solid var(--color-status-rejected)' : '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              GPS Coordinates <span className="required">*</span>
            </label>
            <button
              type="button"
              onClick={fetchGeolocation}
              disabled={gpsLoading}
              className="btn btn-secondary btn-sm"
            >
              <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
              <span>{gpsLoading ? 'Detecting Location...' : 'Use Current Device GPS'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              placeholder="Latitude * (e.g. 12.9716)"
              className={`form-input ${errors.gps ? 'input-error' : ''}`}
            />
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              placeholder="Longitude * (e.g. 77.5946)"
              className={`form-input ${errors.gps ? 'input-error' : ''}`}
            />
          </div>
          {errors.gps && (
            <div className="form-error" style={{ color: 'var(--color-status-rejected)', fontSize: '0.8125rem', marginTop: '6px' }}>
              {errors.gps}
            </div>
          )}
          {gpsError && <div className="form-error" style={{ marginTop: '6px' }}>{gpsError}</div>}
        </div>

        {/* Image Upload with Preview */}
        <div className="form-group">
          <label className="form-label">
            Upload Photographic Evidence (Up to 3 images, max 5MB each)
          </label>
          <div
            style={{
              border: '2px dashed var(--border-subtle)',
              borderRadius: '6px',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-subtle)',
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={selectedImages.length >= 3}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: selectedImages.length >= 3 ? 'not-allowed' : 'pointer'
              }}
            />
            <UploadCloud size={28} style={{ color: 'var(--color-primary)', margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              Click or drag photos here to attach evidence
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              JPEG, PNG, WebP supported. Adding clear photos drastically speeds up field inspection.
            </div>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '14px', flexWrap: 'wrap' }}>
              {imagePreviews.map((preview, idx) => (
                <div key={idx} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                  <img src={preview} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Citizen Contact Section */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Your Contact Details
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              Auto-filled from registered account (Read-only)
            </span>
          </div>

          {(!user?.name || !user?.phone || !user?.email) && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--color-status-rejected)', borderRadius: '6px', marginBottom: '16px', color: 'var(--color-status-rejected)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                Your registered account profile is missing required contact details ({!user?.name ? 'Full Name, ' : ''}{!user?.phone ? 'Phone Number, ' : ''}{!user?.email ? 'Email Address' : ''}). Please complete your account profile before submitting a complaint.
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="citizenName">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="citizenName"
                type="text"
                name="citizenName"
                value={user?.name || formData.citizenName || ''}
                readOnly
                placeholder="Full Name *"
                className={`form-input ${errors.citizenName ? 'input-error' : ''}`}
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  cursor: 'not-allowed',
                  color: 'var(--text-primary)',
                  borderColor: errors.citizenName ? 'var(--color-status-rejected)' : 'var(--border-subtle)'
                }}
              />
              {errors.citizenName && (
                <div className="form-error" style={{ color: 'var(--color-status-rejected)', fontSize: '0.8125rem', marginTop: '4px' }}>
                  {errors.citizenName}
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="citizenPhone">
                Phone Number <span className="required">*</span>
              </label>
              <input
                id="citizenPhone"
                type="tel"
                name="citizenPhone"
                value={user?.phone || formData.citizenPhone || ''}
                readOnly
                placeholder="Phone Number *"
                className={`form-input ${errors.citizenPhone ? 'input-error' : ''}`}
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  cursor: 'not-allowed',
                  color: 'var(--text-primary)',
                  borderColor: errors.citizenPhone ? 'var(--color-status-rejected)' : 'var(--border-subtle)'
                }}
              />
              {errors.citizenPhone && (
                <div className="form-error" style={{ color: 'var(--color-status-rejected)', fontSize: '0.8125rem', marginTop: '4px' }}>
                  {errors.citizenPhone}
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="citizenEmail">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="citizenEmail"
                type="email"
                name="citizenEmail"
                value={user?.email || formData.citizenEmail || ''}
                readOnly
                placeholder="Email Address *"
                className={`form-input ${errors.citizenEmail ? 'input-error' : ''}`}
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  cursor: 'not-allowed',
                  color: 'var(--text-primary)',
                  borderColor: errors.citizenEmail ? 'var(--color-status-rejected)' : 'var(--border-subtle)'
                }}
              />
              {errors.citizenEmail && (
                <div className="form-error" style={{ color: 'var(--color-status-rejected)', fontSize: '0.8125rem', marginTop: '4px' }}>
                  {errors.citizenEmail}
                </div>
              )}
            </div>
          </div>
          <div className="form-hint" style={{ marginTop: '8px' }}>
            Verified from your registered citizen account. Officers will use these contact details to follow up on your grievance.
          </div>
        </div>

        {/* Privacy Policy and Terms Agreement Checkbox */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <input
              id="agreeToTermsCheckbox"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (e.target.checked && errors.agreedToTerms) {
                  setErrors(prev => ({ ...prev, agreedToTerms: '' }));
                }
              }}
              style={{
                marginTop: '3px',
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: 'var(--color-primary)'
              }}
            />
            <label
              htmlFor="agreeToTermsCheckbox"
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
                to="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 600 }}
              >
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link
                to="/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 600 }}
              >
                Terms of Service
              </Link>
              . <span className="required">*</span>
            </label>
          </div>
          {errors.agreedToTerms && (
            <div className="form-error" style={{ marginTop: '6px', marginLeft: '28px' }}>
              {errors.agreedToTerms}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-lg btn-report-accent"
            style={{ minWidth: '220px' }}
          >
            <span className="urgent-dot" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Complaint'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}