import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Clock,
  PlayCircle,
  CheckCircle2,
  Building2,
  MapPin,
  Calendar
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import BackButton from '../../components/BackButton';

export default function AuthorityAssignedComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssigned = async () => {
    setLoading(true);
    setError('');
    try {
      // First try fetching complaints specifically assigned to this officer, or all assigned
      const res = await api.getComplaints({
        assignedOnly: 'true',
        limit: 50
      });

      if (res.success) {
        let list = res.complaints || [];
        // If officer name matches any, filter or prioritize
        if (user?.name) {
          const userAssigned = list.filter(c => 
            c.assignedOfficer && c.assignedOfficer.toLowerCase().includes(user.name.toLowerCase())
          );
          // If direct matches exist, use them, else show all active assigned grievances
          if (userAssigned.length > 0) {
            list = userAssigned;
          }
        }
        setComplaints(list);
      }
    } catch (err) {
      setError(err.message || 'Unable to fetch assigned complaints.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssigned();
  };

  const filtered = complaints.filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        c.referenceId?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.location?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.assignedOfficer?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const assignedCount = complaints.filter(c => c.status === 'Assigned').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="container" style={{ padding: '36px 20px 80px 20px' }}>
      <BackButton fallback="/authority/dashboard" label="Back to Dashboard" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
            <Building2 size={14} />
            <span>Municipal Authority Portal • Official Assignments</span>
          </div>
          <h1 className="page-title">Assigned Grievances</h1>
          <p className="page-subtitle">
            Grievances allocated for field investigation and resolution under <strong>{user?.name || 'Authority Officer'}</strong> ({user?.designation || 'Zonal Officer'})
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="btn btn-secondary btn-sm"
          disabled={loading || refreshing}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh List'}</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Status KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Assigned (Pending Action)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#6D28D9', marginTop: '4px' }}>{assignedCount}</div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#EDE9FE', color: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={18} />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>In Progress (Work Underway)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0369A1', marginTop: '4px' }}>{inProgressCount}</div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlayCircle size={18} />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Resolved (Completed)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#15803D', marginTop: '4px' }}>{resolvedCount}</div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: 'var(--color-accent-green-bg)', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={18} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter by Status:</span>
          {['All', 'Assigned', 'In Progress', 'Resolved'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className="btn btn-sm"
              style={{
                backgroundColor: statusFilter === st ? 'var(--color-primary)' : 'var(--bg-subtle)',
                color: statusFilter === st ? '#FFFFFF' : 'var(--text-primary)',
                borderColor: statusFilter === st ? 'var(--color-primary)' : 'var(--border-subtle)',
                fontSize: '0.8125rem'
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '240px', flex: '1', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reference, title, location..."
            className="form-input"
            style={{ paddingLeft: '36px', height: '36px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>Loading assigned complaints from municipal database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <UserCheck size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No Assigned Grievances Found
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 16px auto' }}>
            {searchTerm || statusFilter !== 'All'
              ? 'No grievances matched your active filters. Try resetting the filters.'
              : 'There are currently no civic complaints assigned to your profile in this department.'}
          </p>
          <Link to="/authority/complaints" className="btn btn-primary btn-sm">
            <span>Browse All Grievances</span>
          </Link>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-subtle)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Reference ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Category & Title</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Location & Ward</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Assigned Officer</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <Link
                        to={`/authority/complaints/${c._id}`}
                        style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
                      >
                        {c.referenceId}
                      </Link>
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: '280px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.title}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {c.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: '220px' }}>
                      <div style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.location}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Ward: {c.ward}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <StatusBadge status={c.status} />
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      {c.assignedOfficer || 'Unassigned'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <Link
                        to={`/authority/complaints/${c._id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.8125rem', padding: '5px 10px' }}
                      >
                        <span>Update Status</span>
                        <ExternalLink size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
