import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Building2, User, Image, AlertCircle, Copy, CheckCircle2, X } from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';
import BackButton from '../components/BackButton';

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  useEffect(() => {
    const fetchComplaint = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.trackComplaint(id);
        if (res.success && res.complaint) {
          setComplaint(res.complaint);
        } else {
          setError('Complaint not found.');
        }
      } catch (err) {
        setError(err.message || 'Unable to retrieve complaint details.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id]);

  const copyRef = () => {
    if (complaint) {
      navigator.clipboard.writeText(complaint.referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>Loading complaint details from civic registry...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="container" style={{ padding: '64px 20px', maxWidth: '640px' }}>
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <div>
            <strong>Grievance Record Not Found</strong>
            <p style={{ marginTop: '4px' }}>{error || 'No complaint matches the specified identifier.'}</p>
          </div>
        </div>
        <BackButton fallback="/track" label="Back to Search" />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '36px 20px 80px 20px', maxWidth: '860px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <BackButton fallback="/track" label="Back to Tracking" style={{ marginBottom: 0 }} />

        <button onClick={copyRef} className="btn btn-secondary btn-sm" style={{ fontSize: '0.8125rem' }}>
          <Copy size={13} />
          <span>{copied ? 'Copied' : 'Copy Reference ID'}</span>
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '32px' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)', padding: '3px 8px', borderRadius: '4px' }}>
                {complaint.category}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Ref: <strong>{complaint.referenceId}</strong>
              </span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {complaint.title}
            </h1>
          </div>

          <StatusBadge status={complaint.status} />
        </div>

        {/* Civic Meta Details List */}
        <div style={{ padding: '24px 0', borderBottom: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              Location & Jurisdiction
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              {complaint.location}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {complaint.ward}, {complaint.city}
            </div>
            {complaint.latitude && complaint.longitude && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                GPS: {complaint.latitude}, {complaint.longitude}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              Assigned Department
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              {complaint.assignedDepartment || 'Central Grievance Redressal Cell'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Designated Officer: {complaint.assignedOfficer || 'Pending Allocation'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              Filing & Last Update
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              Filed: {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Updated: {new Date(complaint.updatedAt || complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div style={{ padding: '24px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Complaint Description
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {complaint.description}
          </p>
        </div>

        {/* Uploaded Evidence */}
        {complaint.images && complaint.images.length > 0 && (
          <div style={{ padding: '24px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Photographic Evidence (Reported Problem)
            </h3>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              {complaint.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setFullscreenImage({ url: getImageUrl(img), caption: `Initial Complaint Photo #${idx + 1}` })}
                  style={{ cursor: 'pointer', width: '140px', height: '140px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}
                  title="Click to view larger"
                >
                  <img src={getImageUrl(img)} alt="Evidence photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolution Proof Section */}
        {complaint.status === 'Resolved' && complaint.resolutionPhoto && (
          <div style={{ padding: '24px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--color-status-resolved-bg)', color: 'var(--color-status-resolved)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-status-resolved)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  ✓ Complaint Resolved
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Resolution Proof
                </h3>
              </div>
            </div>

            {/* Before vs After Visual Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: complaint.images && complaint.images.length > 0 ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr', gap: '18px', marginBottom: '18px' }}>
              {complaint.images && complaint.images.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Before: Reported Issue
                  </div>
                  <div
                    onClick={() => setFullscreenImage({ url: getImageUrl(complaint.images[0]), caption: 'Reported Issue (Before Resolution)' })}
                    style={{ cursor: 'pointer', height: '220px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}
                    title="Click to view full size"
                  >
                    <img
                      src={getImageUrl(complaint.images[0])}
                      alt="Before"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-status-resolved)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  After: Resolution Proof (Work Done)
                </div>
                <div
                  onClick={() => setFullscreenImage({ url: getImageUrl(complaint.resolutionPhoto), caption: 'Official Resolution Photo Proof' })}
                  style={{ cursor: 'pointer', height: '220px', borderRadius: '8px', overflow: 'hidden', border: '2.5px solid var(--color-status-resolved)' }}
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
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '14px 18px', borderRadius: '6px', borderLeft: '4px solid var(--color-status-resolved)', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: 600 }}>
                  Municipal Resolution Note:
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{complaint.resolutionNote}"
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
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

        {/* Chronological Status Timeline */}
        <div style={{ paddingTop: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Status Progression Timeline
          </h3>
          <Timeline history={complaint.statusHistory} />
        </div>
      </div>

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