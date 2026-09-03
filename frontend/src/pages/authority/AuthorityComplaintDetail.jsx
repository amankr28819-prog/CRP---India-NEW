import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  User,
  Image,
  AlertCircle,
  CheckCircle2,
  Send,
  UserCheck,
  Phone,
  Mail
} from 'lucide-react';
import { api, getImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import Timeline from '../../components/Timeline';

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

  // Assignment form state
  const [assignDept, setAssignDept] = useState('');
  const [assignOfficer, setAssignOfficer] = useState('');
  const [assignRemark, setAssignRemark] = useState('');

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

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    setActionLoading(true);
    setActionSuccess('');
    setError('');

    try {
      const res = await api.updateComplaintStatus(complaint._id, {
        status: newStatus,
        remark: statusRemark.trim() || `Status updated to ${newStatus} by ${user?.name || 'Authority'}`
      });

      if (res.success) {
        setComplaint(res.complaint);
        setActionSuccess(`Complaint status successfully updated to ${newStatus}.`);
        setStatusRemark('');
        setTimeout(() => setActionSuccess(''), 4000);
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
        <Link to="/authority/complaints" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Complaints</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '36px 20px 80px 20px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/authority/complaints" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--color-primary)' }}>
          <ArrowLeft size={16} />
          <span>Back to Complaints Registry</span>
        </Link>
      </div>

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

            <StatusBadge status={complaint.status} />
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
              {complaint.latitude && complaint.longitude && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  GPS: {complaint.latitude}, {complaint.longitude}
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
                Attached Photographic Evidence
              </h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {complaint.images.map((img, idx) => (
                  <a key={idx} href={getImageUrl(img)} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100px', height: '100px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    <img src={getImageUrl(img)} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div style={{ paddingTop: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Resolution Audit Trail
            </h3>
            <Timeline history={complaint.statusHistory} />
          </div>
        </div>

        {/* Right Column: Authority Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8125rem' }}>Official Action Remark</label>
                <textarea
                  value={statusRemark}
                  onChange={(e) => setStatusRemark(e.target.value)}
                  rows={3}
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
        </div>
      </div>
    </div>
  );
}