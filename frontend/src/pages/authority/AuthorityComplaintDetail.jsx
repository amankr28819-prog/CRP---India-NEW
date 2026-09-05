import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  User,
  Image,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Send,
  UserCheck,
  Phone,
  Mail,
  Camera,
  X,
  Trash2,
  Archive,
  ExternalLink,
  Flag,
  Copy,
  ThumbsUp
} from 'lucide-react';
import { api, getImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import Timeline from '../../components/Timeline';
import BackButton from '../../components/BackButton';

const DEPARTMENTS = [
  'Public Works Department (Roads)',
  'Solid Waste & Sanitation Department',
  'Municipal Electrical & Lighting Division',
  'Water Supply & Jal Board',
  'Stormwater Drainage & Sewerage Board',
  'Parks & Public Amenities Directorate',
  'Central Civic Redressal Cell'
];

export default function AuthorityComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Status update form state
  const [newStatus, setNewStatus] = useState('');
  const [statusRemark, setStatusRemark] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [resolutionPreview, setResolutionPreview] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const fileInputRef = useRef(null);

  // Assignment form state
  const [assignDept, setAssignDept] = useState('');
  const [assignOfficer, setAssignOfficer] = useState('');
  const [assignRemark, setAssignRemark] = useState('');

  const isValidCoordinate = (lat, lng) => {
    if (lat === null || lat === undefined || lat === '' || lng === null || lng === undefined || lng === '') {
      return false;
    }
    const nLat = Number(lat);
    const nLng = Number(lng);
    if (isNaN(nLat) || isNaN(nLng)) return false;
    if (nLat < -90 || nLat > 90 || nLng < -180 || nLng > 180) return false;
    if (nLat === 0 && nLng === 0) return false;
    return true;
  };

  const fetchComplaint = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.trackComplaint(id);
      if (res.success && res.complaint) {
        setComplaint(res.complaint);
        setNewStatus(res.complaint.status);
        setAssignDept(res.complaint.assignedDepartment || DEPARTMENTS[0]);
        setAssignOfficer(res.complaint.assignedOfficer || '');
        if (res.complaint.resolutionNote) {
          setResolutionNote(res.complaint.resolutionNote);
        }
      } else {
        setError('Complaint record not found.');
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve complaint record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files (JPG, JPEG, PNG, WEBP) are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Resolution image size exceeds maximum 5MB limit.');
      return;
    }

    setError('');
    setResolutionPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setResolutionPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeResolutionPhoto = () => {
    setResolutionPhoto(null);
    setResolutionPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    // Strict validation: Resolution photo required when marking as Resolved
    if (newStatus === 'Resolved') {
      if (!resolutionPhoto && !complaint.resolutionPhoto) {
        setError('A photo showing proof of resolution is required when marking a complaint as Resolved.');
        return;
      }
    }

    setActionLoading(true);
    setActionSuccess('');
    setError('');

    try {
      let payload;
      if (resolutionPhoto || (newStatus === 'Resolved' && resolutionNote)) {
        payload = new FormData();
        payload.append('status', newStatus);
        payload.append('remark', statusRemark.trim() || `Status updated to ${newStatus} by ${user?.name || 'Authority'}`);
        if (resolutionPhoto) {
          payload.append('resolutionPhoto', resolutionPhoto);
        }
        if (resolutionNote.trim()) {
          payload.append('resolutionNote', resolutionNote.trim());
        }
      } else {
        payload = {
          status: newStatus,
          remark: statusRemark.trim() || `Status updated to ${newStatus} by ${user?.name || 'Authority'}`,
          resolutionNote: resolutionNote.trim()
        };
      }

      const res = await api.updateComplaintStatus(complaint._id, payload);

      if (res.success) {
        setComplaint(res.complaint);
        setActionSuccess(`Complaint status successfully updated to ${newStatus}.`);
        setStatusRemark('');
        setResolutionPhoto(null);
        setResolutionPreview('');
        setTimeout(() => setActionSuccess(''), 5000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignment = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionSuccess('');
    setError('');

    try {
      const res = await api.assignComplaint(complaint._id, {
        assignedDepartment: assignDept,
        assignedOfficer: assignOfficer.trim() || 'Designated Field Officer',
        remark: assignRemark.trim() || `Department assigned to ${assignDept}`
      });

      if (res.success) {
        setComplaint(res.complaint);
        setActionSuccess('Department & Officer allocation updated successfully.');
        setAssignRemark('');
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  // Administrative Flagging State & Handlers
  const [flagModalType, setFlagModalType] = useState(null); // 'misinformation' or 'duplicate'
  const [flagExplanation, setFlagExplanation] = useState('');
  const [flagLoading, setFlagLoading] = useState(false);

  const handleFlagSubmit = async (e) => {
    e.preventDefault();
    if (!flagExplanation.trim()) {
      setError('Please provide a detailed explanation for this administrative flag.');
      return;
    }
    setFlagLoading(true);
    setError('');
    try {
      let res;
      if (flagModalType === 'misinformation') {
        res = await api.flagMisinformation(complaint._id, flagExplanation.trim());
      } else {
        res = await api.flagDuplicate(complaint._id, flagExplanation.trim());
      }
      if (res.success) {
        setComplaint(res.complaint);
        setActionSuccess(`Complaint successfully flagged as ${flagModalType === 'misinformation' ? 'Misinformation' : 'Duplicate'}.`);
        setFlagModalType(null);
        setFlagExplanation('');
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to flag complaint.');
    } finally {
      setFlagLoading(false);
    }
  };

  const handleRemoveFlag = async () => {
    if (!window.confirm('Are you sure you want to remove the administrative flag and restore this complaint to the Active pool?')) {
      return;
    }
    setFlagLoading(true);
    setError('');
    try {
      const res = await api.removeFlag(complaint._id, 'Administrative flag cleared by municipal authority. Complaint returned to Active pool.');
      if (res.success) {
        setComplaint(res.complaint);
        setActionSuccess('Administrative flag removed. Complaint restored to active pool.');
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to remove flag.');
    } finally {
      setFlagLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '64px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>Loading complaint docket...</p>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="container" style={{ padding: '64px 20px', maxWidth: '640px' }}>
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
        <BackButton fallback="/authority/complaints" label="Back to Complaints" />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '36px 20px 80px 20px', maxWidth: '1000px' }}>
      <BackButton fallback="/authority/complaints" label="Back to Complaints Registry" />

      {complaint.deletedByCitizen && (
        <div
          style={{
            marginBottom: '24px',
            padding: '16px 20px',
            backgroundColor: '#fff1f2',
            border: '1.5px solid #fecdd3',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <Trash2 size={22} style={{ color: '#e11d48', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#9f1239', fontSize: '0.95rem' }}>
              Status: Deleted by Citizen
            </div>
            <div style={{ fontSize: '0.85rem', color: '#881337', marginTop: '4px', lineHeight: 1.5 }}>
              This complaint was marked as deleted by the citizen who submitted it{complaint.deletedAt ? ` on ${new Date(complaint.deletedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}. This record is retained for municipal reference and historical audit. Further status updates and officer reassignments are permanently disabled.
            </div>
          </div>
        </div>
      )}

      {actionSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '24px' }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Left Details & Right Action Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', alignItems: 'flex-start' }}>
        {/* Left Column: Complaint Details */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                  {complaint.category}
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Ref: <strong>{complaint.referenceId}</strong>
                </span>
              </div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {complaint.title}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {complaint.deletedByCitizen && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca'
                  }}
                >
                  <Trash2 size={13} />
                  Deleted by Citizen
                </span>
              )}
              <StatusBadge status={complaint.status} />
            </div>
          </div>

          {/* Description */}
          <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Citizen Complaint Statement
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '6px', whiteSpace: 'pre-line' }}>
              {complaint.description}
            </p>
          </div>

          {/* Location & Citizen Contact */}
          <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                Locality / Ward
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {complaint.location}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {complaint.ward}, {complaint.city}
              </div>
              {isValidCoordinate(complaint.latitude, complaint.longitude) ? (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    GPS: {complaint.latitude}, {complaint.longitude}
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${Number(complaint.latitude)},${Number(complaint.longitude)}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.875rem',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: 'var(--color-primary)',
                      backgroundColor: 'var(--color-primary-light, rgba(37, 99, 235, 0.08))',
                      borderColor: 'var(--color-primary)',
                      fontWeight: 600,
                      marginTop: '6px',
                      transition: 'all 0.15s ease'
                    }}
                    title="Open exact complaint coordinates in Google Maps"
                  >
                    <MapPin size={17} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <span>View on Google Maps</span>
                    <ExternalLink size={14} style={{ opacity: 0.85, flexShrink: 0 }} />
                  </a>
                </div>
              ) : (
                <div style={{ marginTop: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} style={{ opacity: 0.5 }} />
                  <span>Location unavailable</span>
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                Complainant Contact
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {complaint.citizen?.name || 'Anonymous Resident'}
              </div>
              {complaint.citizen?.phone && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={12} />
                  <span>{complaint.citizen.phone}</span>
                </div>
              )}
              {complaint.citizen?.email && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={12} />
                  <span>{complaint.citizen.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Photos */}
          {complaint.images && complaint.images.length > 0 && (
            <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Attached Photographic Evidence (Reported Issue)
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {complaint.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setFullscreenImage({ url: getImageUrl(img), caption: `Initial Evidence Photo #${idx + 1}` })}
                    style={{ cursor: 'pointer', width: '100px', height: '100px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}
                    title="Click to view full size"
                  >
                    <img src={getImageUrl(img)} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proof of Resolution Display */}
          {(complaint.status === 'Resolved' || complaint.resolutionPhoto) && (
            <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-status-resolved-bg)', color: 'var(--color-status-resolved)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Proof of Resolution
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-status-resolved)', fontWeight: 500 }}>
                    Official Municipal Remediation Record
                  </div>
                </div>
              </div>

              {/* Before vs After Comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: complaint.images && complaint.images.length > 0 ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr', gap: '14px', marginBottom: '14px' }}>
                {complaint.images && complaint.images.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Reported Issue (Before)
                    </div>
                    <div
                      onClick={() => setFullscreenImage({ url: getImageUrl(complaint.images[0]), caption: 'Reported Civic Issue (Before Resolution)' })}
                      style={{ cursor: 'pointer', height: '180px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}
                      title="Click to view full size"
                    >
                      <img
                        src={getImageUrl(complaint.images[0])}
                        alt="Before problem"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                )}

                {complaint.resolutionPhoto && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-status-resolved)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Work Completed (Resolution Proof)
                    </div>
                    <div
                      onClick={() => setFullscreenImage({ url: getImageUrl(complaint.resolutionPhoto), caption: 'Official Resolution Photo Proof (After Work)' })}
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
                )}
              </div>

              {complaint.resolutionNote && (
                <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px 14px', borderRadius: '6px', borderLeft: '3px solid var(--color-status-resolved)', marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 600 }}>
                    Official Resolution Note:
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{complaint.resolutionNote}"
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {complaint.resolvedAt && (
                  <div>
                    <strong>Resolved on:</strong> {new Date(complaint.resolvedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

          {/* Timeline */}
          <div style={{ paddingTop: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Resolution Audit Trail
            </h3>
            <Timeline history={complaint.statusHistory} currentStatus={complaint.status} complaint={complaint} />
          </div>
        </div>

        {/* Right Column: Authority Action Controls or Archived Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {complaint.deletedByCitizen ? (
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Archive size={20} color="var(--color-primary)" />
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Archived Grievance Record
                </h2>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                This grievance was marked as deleted by the submitting citizen. It is permanently retained in the municipal portal as an archived audit record. Administrative actions, status transitions, and department reassignments are locked.
              </p>
              <div style={{ padding: '14px', backgroundColor: 'var(--bg-app)', borderRadius: '6px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Deletion Timestamp:</span>{' '}
                  <strong style={{ color: 'var(--color-status-rejected)' }}>
                    {complaint.deletedAt ? new Date(complaint.deletedAt).toLocaleString('en-IN') : 'Archived'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Last Active Status:</span>{' '}
                  <strong>{complaint.status}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned Department:</span>{' '}
                  <strong>{complaint.assignedDepartment || 'Not assigned'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned Officer:</span>{' '}
                  <strong>{complaint.assignedOfficer || 'Not assigned'}</strong>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Action 1: Status Change */}
              <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  Update Grievance Status
                </h2>

                <form onSubmit={handleStatusUpdate}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8125rem' }}>Select New Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="form-select"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Resolution Proof Section when marking as Resolved */}
                  {newStatus === 'Resolved' && (
                    <div style={{ padding: '16px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: '6px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                        <CheckCircle2 size={16} color="var(--color-status-resolved)" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Photo Proof of Resolution
                        </span>
                      </div>

                      {/* Resolution Note Field */}
                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                          Resolution Note
                        </label>
                        <textarea
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          rows={2}
                          placeholder="e.g. Road pothole repaired and damaged section resurfaced."
                          className="form-textarea"
                          style={{ fontSize: '0.8125rem' }}
                        />
                        <div className="form-hint">Summary of the physical repair or civic work performed.</div>
                      </div>

                      {/* Upload Photo of Resolved Issue */}
                      <div className="form-group" style={{ marginBottom: '0' }}>
                        <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                          Upload Photo of Resolved Issue <span style={{ color: 'var(--color-status-rejected)' }}>*</span>
                        </label>

                        {/* Existing Resolution Photo preview if already on file */}
                        {complaint.resolutionPhoto && !resolutionPreview && (
                          <div style={{ marginBottom: '10px', padding: '8px', border: '1px dashed var(--border-subtle)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={getImageUrl(complaint.resolutionPhoto)}
                              alt="Current Resolution"
                              style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              <strong>Existing Resolution Photo on record.</strong> Choose a new file below to replace it.
                            </div>
                          </div>
                        )}

                        {/* Selected new file preview */}
                        {resolutionPreview ? (
                          <div style={{ position: 'relative', width: '100%', maxHeight: '180px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)', marginBottom: '8px' }}>
                            <img
                              src={resolutionPreview}
                              alt="Resolution preview"
                              style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }}
                            />
                            <button
                              type="button"
                              onClick={removeResolutionPhoto}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                backgroundColor: 'rgba(0,0,0,0.75)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '26px',
                                height: '26px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                              title="Remove photo"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              border: '1.5px dashed var(--border-subtle)',
                              borderRadius: '6px',
                              padding: '16px',
                              textAlign: 'center',
                              cursor: 'pointer',
                              backgroundColor: 'var(--bg-surface)'
                            }}
                          >
                            <Camera size={22} style={{ color: 'var(--color-primary)', margin: '0 auto 6px auto' }} />
                            <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                              Click to upload resolution photo
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Supports JPG, JPEG, PNG (max 5MB)
                            </div>
                          </div>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={handlePhotoChange}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8125rem' }}>Official Action Remark</label>
                    <textarea
                      value={statusRemark}
                      onChange={(e) => setStatusRemark(e.target.value)}
                      rows={2}
                      placeholder="e.g. Field inspection completed. Asphalt patching scheduled for 2 PM."
                      className="form-textarea"
                    />
                    <div className="form-hint">Remark will be appended to the public timeline and logged under your officer name.</div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    {actionLoading ? 'Saving...' : 'Apply Status Change'}
                  </button>
                </form>
              </div>

              {/* Action 2: Department & Officer Allocation */}
              <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  Assign Department & Officer
                </h2>

                <form onSubmit={handleAssignment}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8125rem' }}>Responsible Department</label>
                    <select
                      value={assignDept}
                      onChange={(e) => setAssignDept(e.target.value)}
                      className="form-select"
                    >
                      {DEPARTMENTS.map((dept, i) => (
                        <option key={i} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8125rem' }}>Assigned Field Officer</label>
                    <input
                      type="text"
                      value={assignOfficer}
                      onChange={(e) => setAssignOfficer(e.target.value)}
                      placeholder="e.g. Inspector Ramesh K."
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8125rem' }}>Assignment Instructions (Optional)</label>
                    <input
                      type="text"
                      value={assignRemark}
                      onChange={(e) => setAssignRemark(e.target.value)}
                      placeholder="e.g. Priority dispatch for monsoon preparedness"
                      className="form-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn btn-secondary"
                    style={{ width: '100%', borderColor: 'var(--border-subtle)' }}
                  >
                    {actionLoading ? 'Saving...' : 'Update Assignment'}
                  </button>
                </form>
              </div>

              {/* Action 3: Community Consensus & Administrative Flagging */}
              <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Administrative Flagging & Moderation
                  </h2>
                  <span
                    title={`Net Community Score: ${complaint.netScore || 0}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 10px',
                      borderRadius: '16px',
                      backgroundColor: (complaint.netScore || 0) > 0 ? '#DCFCE7' : (complaint.netScore || 0) < 0 ? '#FEE2E2' : 'var(--bg-app)',
                      color: (complaint.netScore || 0) > 0 ? '#15803D' : (complaint.netScore || 0) < 0 ? '#B91C1C' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.8125rem'
                    }}
                  >
                    <ThumbsUp size={13} />
                    <span>Net Score: {(complaint.netScore || 0) > 0 ? `+${complaint.netScore}` : (complaint.netScore || 0)}</span>
                  </span>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                  Flagging moves the complaint out of the active public feed while preserving community visibility and voting. Reaching 500 unique citizen upvotes automatically restores flagged complaints.
                </p>

                {/* If Currently Flagged */}
                {complaint.flagStatus === 'misinformation' && (
                  <div style={{ padding: '16px', backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: '6px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B91C1C', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                      <AlertTriangle size={16} />
                      <span>Currently Flagged as Misinformation</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#991B1B', marginBottom: '8px', lineHeight: 1.4 }}>
                      <strong>Reason:</strong> {complaint.flagDetails?.explanation || 'Marked as false or unverified.'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#B91C1C', marginBottom: '12px' }}>
                      Flagged by <strong>{complaint.flagDetails?.flaggedByName || 'Municipal Officer'}</strong>
                      {complaint.flagDetails?.flaggedAt && ` on ${new Date(complaint.flagDetails.flaggedAt).toLocaleDateString('en-IN')}`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#7F1D1D', marginBottom: '12px', padding: '6px 10px', backgroundColor: '#FEE2E2', borderRadius: '4px' }}>
                      <strong>Auto-Restoration Status:</strong> {complaint.upvotesCount || 0} / 500 unique upvotes reached
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFlag}
                      disabled={flagLoading}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', borderColor: '#F87171', color: '#B91C1C', fontWeight: 600 }}
                    >
                      {flagLoading ? 'Restoring...' : 'Remove Flag & Restore to Active Pool'}
                    </button>
                  </div>
                )}

                {complaint.flagStatus === 'duplicate' && (
                  <div style={{ padding: '16px', backgroundColor: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: '6px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#B45309', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
                      <Copy size={16} />
                      <span>Currently Flagged as Duplicate</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#92400E', marginBottom: '8px', lineHeight: 1.4 }}>
                      <strong>Reason / Original Ref:</strong> {complaint.flagDetails?.explanation || 'Duplicate of existing complaint.'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#B45309', marginBottom: '12px' }}>
                      Flagged by <strong>{complaint.flagDetails?.flaggedByName || 'Municipal Officer'}</strong>
                      {complaint.flagDetails?.flaggedAt && ` on ${new Date(complaint.flagDetails.flaggedAt).toLocaleDateString('en-IN')}`}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#78350F', marginBottom: '12px', padding: '6px 10px', backgroundColor: '#FEF3C7', borderRadius: '4px' }}>
                      <strong>Auto-Restoration Status:</strong> {complaint.upvotesCount || 0} / 500 unique upvotes reached
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFlag}
                      disabled={flagLoading}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', borderColor: '#FBBF24', color: '#B45309', fontWeight: 600 }}
                    >
                      {flagLoading ? 'Restoring...' : 'Remove Flag & Restore to Active Pool'}
                    </button>
                  </div>
                )}

                {/* If Not Flagged: Show Flag Actions */}
                {(!complaint.flagStatus || complaint.flagStatus === 'none') && (
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <button
                      type="button"
                      onClick={() => { setFlagModalType('misinformation'); setFlagExplanation(''); }}
                      className="btn btn-secondary btn-sm"
                      style={{ borderColor: '#FCA5A5', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <AlertTriangle size={14} />
                      <span>Flag as Misinformation</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setFlagModalType('duplicate'); setFlagExplanation(''); }}
                      className="btn btn-secondary btn-sm"
                      style={{ borderColor: '#FCD34D', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <Copy size={14} />
                      <span>Flag as Duplicate</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Flagging Modal */}
      {flagModalType && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            backdropFilter: 'blur(2px)'
          }}
          onClick={() => setFlagModalType(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {flagModalType === 'misinformation' ? (
                  <AlertTriangle size={20} style={{ color: '#DC2626' }} />
                ) : (
                  <Copy size={20} style={{ color: '#D97706' }} />
                )}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Flag Complaint as {flagModalType === 'misinformation' ? 'Misinformation' : 'Duplicate'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFlagModalType(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              {flagModalType === 'misinformation'
                ? 'Please specify the exact factual reason why this grievance is classified as misinformation. This explanation will be publicly visible to citizens and logged for accountability.'
                : 'Please specify the reason or provide the Reference ID of the primary complaint this duplicates.'}
            </p>

            <form onSubmit={handleFlagSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                  Official Explanation / Reference <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={flagExplanation}
                  onChange={(e) => setFlagExplanation(e.target.value)}
                  placeholder={flagModalType === 'misinformation' ? 'e.g. Field inspection confirmed no sewage leakage exists at Metro Pillar 42. Image submitted matches a different city.' : 'e.g. Duplicate of active grievance CRP-2026-00101 filed for identical location.'}
                  className="form-textarea"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setFlagModalType(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={flagLoading}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: flagModalType === 'misinformation' ? '#DC2626' : '#D97706',
                    color: '#fff'
                  }}
                >
                  {flagLoading ? 'Submitting Flag...' : `Confirm Flag as ${flagModalType === 'misinformation' ? 'Misinformation' : 'Duplicate'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Large Image Inspection */}
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