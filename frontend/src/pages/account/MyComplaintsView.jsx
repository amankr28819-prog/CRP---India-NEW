import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
  Clock,
  ChevronRight,
  X,
  Image as ImageIcon,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { api, getImageUrl } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import Timeline from '../../components/Timeline';

export default function MyComplaintsView() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Selected complaint for modal details view
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      params.sort = sortOrder;

      const res = await api.getMyComplaints(params);
      if (res.success && res.complaints) {
        setComplaints(res.complaints);
      }
    } catch (err) {
      console.error('Failed to load my complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const statusTabs = ['All', 'Submitted', 'In Progress', 'Resolved', 'Rejected'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* View Header with CTA */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            My Civic Complaints
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Track and monitor the resolution progress of issues reported by you.
          </p>
        </div>

        <Link to="/report" className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
          <PlusCircle size={15} />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {/* Status Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none'
          }}
        >
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 600 : 500,
                  border: 'none',
                  backgroundColor: isActive ? 'var(--color-primary)' : 'var(--bg-subtle)',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <form
            onSubmit={handleSearchSubmit}
            style={{
              position: 'relative',
              flex: '1 1 240px',
              display: 'flex'
            }}
          >
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, category, city..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  // Trigger search with empty query
                  setTimeout(fetchComplaints, 0);
                }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Sort selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpDown size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints List or States */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--color-primary)' }} />
          <p style={{ fontSize: '0.9rem' }}>Loading your registered complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px'
            }}
          >
            <FileText size={28} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {statusFilter !== 'All' || searchQuery ? 'No matching complaints found' : 'No complaints reported yet'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: 0 }}>
            {statusFilter !== 'All' || searchQuery
              ? 'Try changing your filter settings or clearing the search query to see other complaints.'
              : 'Have you spotted a pothole, broken streetlight, or garbage dump? File a complaint to notify municipal authorities.'}
          </p>
          {statusFilter !== 'All' || searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('All');
                setSearchQuery('');
              }}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '8px' }}
            >
              Reset Filters
            </button>
          ) : (
            <Link to="/report" className="btn btn-primary btn-sm" style={{ marginTop: '8px', gap: '6px' }}>
              <PlusCircle size={15} />
              <span>Report an Issue</span>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {complaints.map((c) => {
            const formattedDate = new Date(c.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={c._id || c.referenceId}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* Top Row: Ref ID, Category, Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        color: 'var(--color-primary)',
                        backgroundColor: 'rgba(30, 64, 175, 0.08)',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {c.referenceId}
                    </span>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--bg-subtle)',
                        padding: '3px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {c.category}
                    </span>
                  </div>

                  <StatusBadge status={c.status} />
                </div>

                {/* Title & Description */}
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                    {c.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {c.description}
                  </p>
                </div>

                {/* Metadata details row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    flexWrap: 'wrap',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    paddingTop: '6px',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={13} />
                    <span>{c.location}, Ward {c.ward}, {c.city}</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={13} />
                    <span>Submitted {formattedDate}</span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Building2 size={13} />
                    <span>{c.assignedDepartment}</span>
                  </span>
                </div>

                {/* If Resolved, showcase brief resolution proof */}
                {c.status === 'Resolved' && (
                  <div
                    style={{
                      backgroundColor: 'var(--color-accent-green-bg, #DCFCE7)',
                      border: '1px solid rgba(21, 128, 61, 0.2)',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <CheckCircle2 size={16} style={{ color: 'var(--color-accent-green, #15803D)', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-accent-green, #15803D)' }}>
                      <strong>Resolved:</strong> {c.resolutionNote || 'Civic defect resolved and verified by municipal authority.'}
                    </div>
                  </div>
                )}

                {/* Bottom Row Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(c)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '6px' }}
                  >
                    <span>View Timeline & History</span>
                    <ChevronRight size={14} />
                  </button>
                  <Link
                    to={`/complaint/${c.referenceId}`}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '6px' }}
                  >
                    <span>Full Details</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal View for Quick Timeline & History */}
      {selectedComplaint && (
        <div
          className="logout-modal-backdrop"
          onClick={() => setSelectedComplaint(null)}
          style={{ zIndex: 100 }}
        >
          <div
            className="logout-confirm-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '680px',
              width: '90vw',
              maxHeight: '85vh',
              overflowY: 'auto',
              textAlign: 'left',
              padding: '24px'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '14px',
                marginBottom: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: 'var(--color-primary)',
                      backgroundColor: 'rgba(30, 64, 175, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    {selectedComplaint.referenceId}
                  </span>
                  <StatusBadge status={selectedComplaint.status} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {selectedComplaint.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Department & Assignment */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '18px',
                fontSize: '0.85rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px'
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Department: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedComplaint.assignedDepartment}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Officer: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedComplaint.assignedOfficer}</strong>
              </div>
            </div>

            {/* Complaint Photos if any */}
            {selectedComplaint.images && selectedComplaint.images.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Submitted Photos
                </h4>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
                  {selectedComplaint.images.map((img, idx) => (
                    <a
                      key={idx}
                      href={getImageUrl(img)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'block', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`Complaint photo ${idx + 1}`}
                        style={{ width: '100px', height: '80px', objectFit: 'cover' }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Photo if any */}
            {selectedComplaint.resolutionPhoto && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-accent-green)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Proof of Resolution
                </h4>
                <a
                  href={getImageUrl(selectedComplaint.resolutionPhoto)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', borderRadius: '6px', overflow: 'hidden', border: '2px solid var(--color-accent-green)' }}
                >
                  <img
                    src={getImageUrl(selectedComplaint.resolutionPhoto)}
                    alt="Proof of Resolution"
                    style={{ maxWidth: '200px', height: 'auto', maxHeight: '140px', objectFit: 'cover' }}
                  />
                </a>
              </div>
            )}

            {/* Timeline History */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Official Redressal Timeline
              </h4>
              {selectedComplaint.statusHistory && selectedComplaint.statusHistory.length > 0 ? (
                <Timeline history={selectedComplaint.statusHistory} />
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No status updates recorded yet.</p>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
