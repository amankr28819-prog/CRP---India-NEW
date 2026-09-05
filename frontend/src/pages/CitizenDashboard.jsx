import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  AlertCircle,
  UserCheck,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Search,
  ArrowUpDown,
  X,
  TrendingUp,
  AlertTriangle,
  Copy,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import BackButton from '../components/BackButton';
import VotingButtons from '../components/VotingButtons';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Sorting State
  const [activeStatusFilter, setActiveStatusFilter] = useState('Total Complaints');
  const [flagTab, setFlagTab] = useState('active'); // 'active', 'misinformation', 'duplicate'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' (default) or 'votes'
  
  // Full list of complaints loaded from backend
  const [complaintsList, setComplaintsList] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);

  // Fetch Dashboard KPI Stats
  const fetchDashboardStats = async () => {
    try {
      const res = await api.getCitizenDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load citizen grievance dashboard metrics.');
    }
  };

  // Fetch Complaints with active filters, search, and sorting
  const fetchComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const params = {
        limit: 50,
        sort: sortBy
      };

      // Status card filter
      if (activeStatusFilter && activeStatusFilter !== 'Total Complaints') {
        params.status = activeStatusFilter;
      }

      // Flag filter tab
      if (flagTab === 'misinformation') {
        params.flagFilter = 'misinformation';
      } else if (flagTab === 'duplicate') {
        params.flagFilter = 'duplicate';
      } else {
        params.flagFilter = 'none'; // active pool
      }

      // Search keyword
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await api.getComplaints(params);
      if (res.success) {
        setComplaintsList(res.complaints || []);
      }
    } catch (err) {
      console.error('[CITIZEN DASHBOARD] Failed to load complaints:', err);
    } finally {
      setComplaintsLoading(false);
    }
  };

  const reloadAll = async () => {
    setLoading(true);
    setError('');
    await Promise.all([fetchDashboardStats(), fetchComplaints()]);
    setLoading(false);
  };

  useEffect(() => {
    reloadAll();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [activeStatusFilter, flagTab, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    // Trigger re-fetch immediately with empty search
    setTimeout(() => {
      api.getComplaints({
        limit: 50,
        sort: sortBy,
        status: activeStatusFilter !== 'Total Complaints' ? activeStatusFilter : undefined,
        flagFilter: flagTab === 'misinformation' ? 'misinformation' : flagTab === 'duplicate' ? 'duplicate' : 'none'
      }).then(res => {
        if (res.success) setComplaintsList(res.complaints || []);
      });
    }, 0);
  };

  const handleCardClick = (filterName) => {
    if (activeStatusFilter === filterName && filterName !== 'Total Complaints') {
      setActiveStatusFilter('Total Complaints');
    } else {
      setActiveStatusFilter(filterName);
    }
  };

  const handleVoteUpdated = (updatedVote) => {
    setComplaintsList(prev =>
      prev.map(c => {
        if (c._id === updatedVote.complaintId) {
          return {
            ...c,
            upvotesCount: updatedVote.upvotesCount,
            downvotesCount: updatedVote.downvotesCount,
            netScore: updatedVote.netScore,
            userVote: updatedVote.userVote,
            flagStatus: updatedVote.autoRestored ? 'none' : c.flagStatus
          };
        }
        return c;
      })
    );
  };

  const stats = data?.stats || {
    total: 0,
    underReview: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    misinformationCount: 0,
    duplicateCount: 0
  };

  // Change 3: Exactly 5 status cards. "Submitted" is completely removed.
  const statCards = [
    { label: 'Total Complaints', value: stats.total, icon: FileText, color: 'var(--color-primary)', bg: 'var(--color-primary-light)', filterKey: 'Total Complaints' },
    { label: 'Under Review', value: stats.underReview, icon: AlertCircle, color: '#B45309', bg: 'var(--color-accent-amber-bg)', filterKey: 'Under Review' },
    { label: 'Assigned', value: stats.assigned, icon: UserCheck, color: '#6D28D9', bg: '#EDE9FE', filterKey: 'Assigned' },
    { label: 'In Progress', value: stats.inProgress, icon: PlayCircle, color: '#0369A1', bg: '#E0F2FE', filterKey: 'In Progress' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: '#15803D', bg: 'var(--color-accent-green-bg)', filterKey: 'Resolved' }
  ];

  const categoryStats = data?.categoryStats || [];
  const wardStats = data?.wardStats || [];

  return (
    <div className="container" style={{ padding: '36px 20px 80px 20px' }}>
      <BackButton fallback="/" />

      {/* Citizen Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
            <ShieldCheck size={14} style={{ color: 'var(--color-accent-green)' }} />
            <span>Citizen Grievance & Resolution Portal (Read-Only)</span>
          </div>
          <h1 className="page-title">Public Grievance Dashboard</h1>
          <p className="page-subtitle">
            Welcome, <strong>{user?.name || 'Citizen'}</strong> — Live civic metrics, interactive voting, and municipal transparency tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={reloadAll} className="btn btn-secondary btn-sm" title="Refresh metrics and grievances">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <Link to="/citizens" className="btn btn-secondary btn-sm" title="Browse verified citizens directory">
            <Layers size={14} />
            <span>Citizen Directory</span>
          </Link>

          <Link to="/track" className="btn btn-secondary btn-sm" title="Track a complaint by Reference ID">
            <Search size={14} />
            <span>Track by ID</span>
          </Link>

          <Link to="/report" className="btn btn-primary btn-sm btn-report-accent" title="File a new grievance">
            <span className="urgent-dot" />
            <span>Report Issue</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Change 3 & 4: Exactly 5 KPI Status Cards acting as interactive filters */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Status Overview (Click card to filter list)
          </span>
          {activeStatusFilter !== 'Total Complaints' && (
            <button
              onClick={() => setActiveStatusFilter('Total Complaints')}
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Reset filter</span>
              <X size={13} />
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginBottom: '32px'
          }}
        >
          {statCards.map((c, i) => {
            const Icon = c.icon;
            const isSelected = activeStatusFilter === c.filterKey;
            return (
              <div
                key={i}
                onClick={() => handleCardClick(c.filterKey)}
                style={{
                  backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--bg-surface)',
                  border: isSelected ? `2px solid ${c.color}` : '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '18px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.color }} />
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8125rem', color: isSelected ? c.color : 'var(--text-secondary)', fontWeight: isSelected ? 700 : 500 }}>
                    {c.label}
                  </span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} />
                  </div>
                </div>

                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {c.value}
                </div>

                <div style={{ marginTop: '10px', fontSize: '0.72rem', color: isSelected ? c.color : 'var(--text-muted)', fontWeight: 500 }}>
                  {isSelected ? 'Active Filter • Click to clear' : 'Click to filter'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Change 1 Parity: Category Distribution & Top Active Wards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        {/* Category Breakdown */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <TrendingUp size={16} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Category Distribution</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categoryStats.length > 0 ? (
              categoryStats.map((item, idx) => {
                const pct = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0;
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item._id}</span>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{item.count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No category data available yet.</p>
            )}
          </div>
        </div>

        {/* Top Active Wards */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <MapPin size={16} style={{ color: 'var(--color-accent-amber)' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>Top Active Municipal Wards</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {wardStats.length > 0 ? (
              wardStats.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700 }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item._id || 'Unassigned Ward'}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{item.count} complaints</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No ward data recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Complaints Section (Read-only, Search, Sort, Voting, Tabs) */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px' }}>
        
        {/* Pool Tabs: Active Complaints / Misinformation / Duplicate */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFlagTab('active')}
            style={{
              background: flagTab === 'active' ? 'var(--color-primary)' : 'transparent',
              color: flagTab === 'active' ? '#fff' : 'var(--text-secondary)',
              border: '1px solid',
              borderColor: flagTab === 'active' ? 'var(--color-primary)' : 'var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Active Grievances
          </button>

          <button
            type="button"
            onClick={() => setFlagTab('misinformation')}
            style={{
              background: flagTab === 'misinformation' ? '#DC2626' : 'transparent',
              color: flagTab === 'misinformation' ? '#fff' : '#DC2626',
              border: '1px solid',
              borderColor: flagTab === 'misinformation' ? '#DC2626' : '#FCA5A5',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlertTriangle size={13} />
            <span>Flagged as Misinformation ({stats.misinformationCount || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setFlagTab('duplicate')}
            style={{
              background: flagTab === 'duplicate' ? '#D97706' : 'transparent',
              color: flagTab === 'duplicate' ? '#fff' : '#D97706',
              border: '1px solid',
              borderColor: flagTab === 'duplicate' ? '#D97706' : '#FCD34D',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Copy size={13} />
            <span>Flagged as Duplicate ({stats.duplicateCount || 0})</span>
          </button>
        </div>

        {/* Change 5 & 6: Search Bar & Sorting Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          {/* Search by Title or ID */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 300px', maxWidth: '440px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search complaints by title or Reference ID..."
                style={{
                  width: '100%',
                  padding: '8px 36px 8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8125rem'
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  title="Clear search"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '8px 12px' }}>
              <Search size={14} />
            </button>
          </form>

          {/* Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowUpDown size={14} style={{ color: 'var(--text-secondary)' }} />
            <label htmlFor="citizen-sort-order" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Sort:
            </label>
            <select
              id="citizen-sort-order"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="newest">Date — Newest First (Default)</option>
              <option value="votes">Vote Count — Highest First</option>
              <option value="oldest">Date — Oldest First</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {(activeStatusFilter !== 'Total Complaints' || searchTerm || flagTab !== 'active') && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-primary-light)',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '0.8125rem',
              color: 'var(--color-primary)',
              marginBottom: '16px'
            }}
          >
            <div>
              <strong>Filtered by:</strong>{' '}
              {activeStatusFilter !== 'Total Complaints' && `Status: ${activeStatusFilter}`}
              {activeStatusFilter !== 'Total Complaints' && (searchTerm || flagTab !== 'active') && ' • '}
              {searchTerm && `Search: "${searchTerm}"`}
              {searchTerm && flagTab !== 'active' && ' • '}
              {flagTab !== 'active' && `Pool: ${flagTab === 'misinformation' ? 'Misinformation' : 'Duplicate'}`}
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveStatusFilter('Total Complaints');
                setSearchTerm('');
                setFlagTab('active');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.75rem',
                textDecoration: 'underline'
              }}
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Table of Complaints */}
        <div className="table-responsive">
          <table className="civic-table">
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Category</th>
                <th>Title / Locality</th>
                <th>Ward / City</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Community Votes</th>
                <th>Submitted Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaintsLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    <RefreshCw size={16} className="spin" style={{ display: 'inline', marginRight: '8px' }} />
                    Loading grievances...
                  </td>
                </tr>
              ) : complaintsList && complaintsList.length > 0 ? (
                complaintsList.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <Link to={`/complaint/${c.referenceId}`} style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        {c.referenceId}
                      </Link>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{c.category}</span>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.location}
                      </div>

                      {/* Flag Warning Tags if applicable */}
                      {c.flagStatus === 'misinformation' && (
                        <div style={{ marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          <AlertTriangle size={11} />
                          <span>Flagged: Misinformation</span>
                        </div>
                      )}
                      {c.flagStatus === 'duplicate' && (
                        <div style={{ marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          <Copy size={11} />
                          <span>Flagged: Duplicate</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem' }}>{c.ward}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.city}</div>
                    </td>
                    <td>
                      <StatusBadge status={c.status} size="small" />
                    </td>
                    {/* Community Voting Controls */}
                    <td style={{ textAlign: 'center' }}>
                      <VotingButtons
                        complaint={c}
                        onVoteChange={handleVoteUpdated}
                        size="small"
                      />
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <Link to={`/complaint/${c.referenceId}`} className="btn btn-secondary btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    {searchTerm ? (
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                          No complaints found matching "{searchTerm}".
                        </p>
                        <p style={{ fontSize: '0.8125rem' }}>Try a different keyword or clear the active search filter.</p>
                      </div>
                    ) : (
                      <p>No complaints found in this status or category.</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
