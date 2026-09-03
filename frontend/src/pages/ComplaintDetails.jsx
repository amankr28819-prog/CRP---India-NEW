import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Building2, User, Image, AlertCircle, Copy } from 'lucide-react';
import { api, getImageUrl } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Timeline from '../components/Timeline';

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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
        <Link to="/track" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Search</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '36px 20px 80px 20px', maxWidth: '860px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Link to="/track" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--color-primary)' }}>
          <ArrowLeft size={16} />
          <span>Back to Tracking</span>
        </Link>

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
              Photographic Evidence
            </h3>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              {complaint.images.map((img, idx) => (
                <a key={idx} href={getImageUrl(img)} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '140px', height: '140px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                  <img src={getImageUrl(img)} alt="Evidence photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </a>
              ))}
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
    </div>
  );
}