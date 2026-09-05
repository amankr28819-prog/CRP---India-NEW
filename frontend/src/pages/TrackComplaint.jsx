import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Building2, User, Image, AlertCircle, Clock, ExternalLink, CheckCircle2, X } from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import BackButton from '../components/BackButton';

export default function TrackComplaint() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [refInput, setRefInput] = useState(searchParams.get('ref') || '');
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState(null);

  useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    if (refFromUrl) {
      setRefInput(refFromUrl);
      executeSearch(refFromUrl);
    }
  }, [searchParams]);

  const executeSearch = async (refId) => {
    const cleanId = refId ? refId.trim() : '';
    if (!cleanId) {
      setErrorMessage('Please enter a valid Reference ID.');
      setComplaint(null);
      setSearched(true);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setComplaint(null);
    setSearched(true);

    try {
      const res = await api.trackComplaint(cleanId);
      if (res.success && res.complaint) {
        setComplaint(res.complaint);
      } else {
        setErrorMessage('Complaint not found. Please check your reference ID.');
      }
    } catch (err) {
      if (err.status === 404) {
        setErrorMessage('Complaint not found. Please check your reference ID.');
      } else {
        setErrorMessage(err.message || 'Unable to connect to server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (refInput.trim()) {
      setSearchParams({ ref: refInput.trim() });
      executeSearch(refInput.trim());
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px 20px', maxWidth: '820px' }}>
      <BackButton fallback="/" />
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Track your complaint</h1>
        <p className="page-subtitle">
          Enter your Reference ID to see the latest updates on your problem.
        </p>
      </div>

      {/* Clean Track Input Form */}
      <form onSubmit={handleSearchSubmit} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" htmlFor="referenceInput">
            Enter Complaint Reference ID
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              id="referenceInput"
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="e.g. CRP-2026-00101"
              className="form-input"
              style={{ flex: 1, minWidth: '220px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}
            />
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ minWidth: '130px' }}
            >
              <Search size={16} />
              <span>{loading ? 'Searching...' : 'Track Status'}</span>
            </button>
          </div>
          <div className="form-hint">
            Your Reference ID was provided when you submitted your complaint (e.g. CRP-2026-00101).
          </div>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>Fetching complaint record from civic registry...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error / Not Found State */}
      {!loading && searched && errorMessage && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Lookup Failed</strong>
            <p style={{ marginTop: '2px', fontSize: '0.875rem' }}>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Result Card: ONLY shown after valid search */}
      {!loading && searched && complaint && (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Header Banner */}
          <div style={{ padding: '20px 24px', backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
                Complaint ID
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.02em' }}>
                {complaint.referenceId}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {complaint.deletedByCitizen ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: 'var(--color-status-rejected, #DC2626)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  <AlertCircle size={14} />
                  <span>Complaint Deleted</span>
                </span>
              ) : (
                <StatusBadge status={complaint.status} />
              )}
              <Link
                to={`/complaint/${complaint.referenceId}`}
                className="btn btn-secondary btn-sm"
                title="Open full page view"
              >
                <span>Full Details</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>

          {/* Body Info */}
          <div style={{ padding: '24px' }}>
            {/* Deleted by Citizen Alert Notice */}
            {complaint.deletedByCitizen && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '6px',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <AlertCircle size={22} style={{ color: 'var(--color-status-rejected, #DC2626)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-status-rejected, #DC2626)' }}>
                    Complaint Deleted
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: '2px' }}>
                    This complaint has been deleted by the citizen who submitted it.
                    {complaint.deletedAt && (
                      <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>
                        (Deleted on {new Date(complaint.deletedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Title & Category */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'inline-block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)', padding: '2px 8px', borderRadius: '4px', marginBottom: '8px' }}>
                {complaint.category}
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                {complaint.title}
              </h2>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Description
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, backgroundColor: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: '6px' }}>
                {complaint.description}
              </p>
            </div>

            {/* Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  <MapPin size={13} />
                  <span>Location</span>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {complaint.location}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {complaint.ward}, {complaint.city}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  <Building2 size={13} />
                  <span>Assigned Department</span>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {complaint.assignedDepartment || 'Central Grievance Redressal Cell'}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Officer: {complaint.assignedOfficer || 'Pending Allocation'}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  <Clock size={13} />
                  <span>Last Updated</span>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {new Date(complaint.updatedAt || complaint.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Filed: {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Uploaded Evidence Photos if any */}
            {complaint.images && complaint.images.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Photographic Evidence (Reported Problem)
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {complaint.images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setFullscreenImage({ url: getImageUrl(img), caption: `Initial Complaint Photo #${idx + 1}` })}
                      style={{ cursor: 'pointer', width: '110px', height: '110px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}
                      title="Click to view full size"
                    >
                      <img src={getImageUrl(img)} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Proof Section */}
            {!complaint.deletedByCitizen && complaint.status === 'Resolved' && complaint.resolutionPhoto && (
              <div style={{ marginBottom: '28px', padding: '20px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--color-status-resolved-bg)', color: 'var(--color-status-resolved)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-status-resolved)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      ✓ Complaint Resolved
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Resolution Proof
                    </h3>
                  </div>
                </div>

                {/* Before vs After Visual Comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: complaint.images && complaint.images.length > 0 ? 'repeat(auto-fit, minmax(220px, 1fr))' : '1fr', gap: '14px', marginBottom: '16px' }}>
                  {complaint.images && complaint.images.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Before (Reported Problem)
                      </div>
                      <div
                        onClick={() => setFullscreenImage({ url: getImageUrl(complaint.images[0]), caption: 'Reported Problem (Before Resolution)' })}
                        style={{ cursor: 'pointer', height: '180px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}
                        title="Click to view full size"
                      >
                        <img
                          src={getImageUrl(complaint.images[0])}
                          alt="Reported problem"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-status-resolved)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      After (Resolution Proof)
                    </div>
                    <div
                      onClick={() => setFullscreenImage({ url: getImageUrl(complaint.resolutionPhoto), caption: 'Official Resolution Photo Proof' })}
                      style={{ cursor: 'pointer', height: '180px', borderRadius: '6px', overflow: 'hidden', border: '2px solid var(--color-status-resolved)' }}
                      title="Click to view full size"
                    >
                      <img
                        src={getImageUrl(complaint.resolutionPhoto)}
                        alt="Resolution proof"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                </div>

                {complaint.resolutionNote && (
                  <div style={{ backgroundColor: 'var(--bg-surface)', padding: '12px 14px', borderRadius: '6px', borderLeft: '3.5px solid var(--color-status-resolved)', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 600 }}>
                      Resolution Summary:
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                      "{complaint.resolutionNote}"
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {complaint.resolvedAt && (
                    <div>
                      <strong>Resolved on:</strong> {new Date(complaint.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                  {complaint.resolvedBy && (
                    <div>
                      <strong>Resolved by:</strong> {complaint.resolvedBy}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Status Timeline
              </h3>
              <Timeline history={complaint.statusHistory} currentStatus={complaint.status} complaint={complaint} />
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {fullscreenImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px',
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setFullscreenImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{ position: 'relative', maxWidth: '92vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setFullscreenImage(null)}
              style={{
                alignSelf: 'flex-end',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                marginBottom: '10px'
              }}
            >
              <X size={16} />
              <span>Close Preview</span>
            </button>
            <img
              src={fullscreenImage.url}
              alt={fullscreenImage.caption || 'Enlarged photo'}
              style={{ maxWidth: '92vw', maxHeight: '78vh', objectFit: 'contain', borderRadius: '6px', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}
            />
            {fullscreenImage.caption && (
              <div style={{ color: '#e5e7eb', marginTop: '12px', fontSize: '0.875rem', fontWeight: 500, textAlign: 'center' }}>
                {fullscreenImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}