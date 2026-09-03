import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Building2, User, Image, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';

export default function TrackComplaint() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [refInput, setRefInput] = useState(searchParams.get('ref') || '');
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Track your complaint</h1>
        <p className="page-subtitle">
          Check live verification status, assigned municipal engineer, and resolution history.
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
            Reference IDs are issued upon grievance registration in the format CRP-YYYY-XXXXX.
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
              <StatusBadge status={complaint.status} />
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
                  Photographic Evidence ({complaint.images.length})
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {complaint.images.map((img, idx) => (
                    <a key={idx} href={getImageUrl(img)} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '110px', height: '110px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                      <img src={getImageUrl(img)} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Status Timeline
              </h3>
              <Timeline history={complaint.statusHistory} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}