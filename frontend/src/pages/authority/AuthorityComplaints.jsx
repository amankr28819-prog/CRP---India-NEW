import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  ArrowUpDown,
  X,
  AlertTriangle,
  Copy,
  ThumbsUp
} from 'lucide-react';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { CATEGORIES } from '../CategorySelect';
import BackButton from '../../components/BackButton';

export default function AuthorityComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [flagFilter, setFlagFilter] = useState('active'); // 'active', 'misinformation', 'duplicate'
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 15
      };
      if (statusFilter !== 'All') params.status = statusFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (sortBy) params.sort = sortBy;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      if (flagFilter === 'misinformation') {
        params.flagFilter = 'misinformation';
      } else if (flagFilter === 'duplicate') {
        params.flagFilter = 'duplicate';
      } else {
        params.flagFilter = 'none';
      }

      const res = await api.getComplaints(params);
      if (res.success) {
        setComplaints(res.complaints || []);
        setTotalPages(res.pages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Unable to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, sortBy, flagFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setStatusFilter('All');
    setCategoryFilter('All');
    setSortBy('newest');
    setFlagFilter('active');
    setSearchTerm('');
    setPage(1);
  };

  return (
    <div className="container" style={{ padding: '36px 20px 80px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <BackButton fallback="/authority/dashboard" label="Back to Dashboard" style={{ marginBottom: '8px' }} />
          <h1 className="page-title">Grievance Management Registry</h1>
          <p className="page-subtitle">
            Showing {complaints.length} of {totalCount} municipal grievances
          </p>
        </div>

        <button onClick={fetchComplaints} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Pool Tabs: Active / Misinformation / Duplicate */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => { setFlagFilter('active'); setPage(1); }}
          style={{
            background: flagFilter === 'active' ? 'var(--color-primary)' : 'var(--bg-surface)',
            color: flagFilter === 'active' ? '#fff' : 'var(--text-secondary)',
            border: '1px solid',
            borderColor: flagFilter === 'active' ? 'var(--color-primary)' : 'var(--border-subtle)',
            borderRadius: '6px',
            padding: '7px 16px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Active Complaints
        </button>

        <button
          type="button"
          onClick={() => { setFlagFilter('misinformation'); setPage(1); }}
          style={{
            background: flagFilter === 'misinformation' ? '#DC2626' : 'var(--bg-surface)',
            color: flagFilter === 'misinformation' ? '#fff' : '#DC2626',
            border: '1px solid',
            borderColor: flagFilter === 'misinformation' ? '#DC2626' : '#FCA5A5',
            borderRadius: '6px',
            padding: '7px 16px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <AlertTriangle size={14} />
          <span>Flagged as Misinformation</span>
        </button>

        <button
          type="button"
          onClick={() => { setFlagFilter('duplicate'); setPage(1); }}
          style={{
            background: flagFilter === 'duplicate' ? '#D97706' : 'var(--bg-surface)',
            color: flagFilter === 'duplicate' ? '#fff' : '#D97706',
            border: '1px solid',
            borderColor: flagFilter === 'duplicate' ? '#D97706' : '#FCD34D',
            borderRadius: '6px',
            padding: '7px 16px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Copy size={14} />
          <span>Flagged as Duplicate</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
          {/* Keyword Search */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Search Reference / Title</label>
            <div style={{ display: 'flex', gap: '6px', position: 'relative' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. CRP-2026-00101 or pothole"
                className="form-input"
                style={{ fontSize: '0.875rem', paddingRight: searchTerm ? '32px' : '12px' }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); setPage(1); }}
                  title="Clear search"
                  style={{
                    position: 'absolute',
                    right: '50px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                </button>
              )}
              <button type="submit" className="btn btn-primary btn-sm">
                <Search size={15} />
              </button>
            </div>
          </div>

          {/* Change 3: Status Filter WITHOUT "Submitted" */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="form-select"
              style={{ fontSize: '0.875rem' }}
            >
              <option value="All">All Statuses</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Filter by Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="form-select"
              style={{ fontSize: '0.875rem' }}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.slug} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Change 6: Sort By with Vote Count option */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Sort Complaints</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="form-select"
              style={{ fontSize: '0.875rem' }}
            >
              <option value="newest">Date — Newest First (Default)</option>
              <option value="votes">Vote Count — Highest First</option>
              <option value="oldest">Date — Oldest First</option>
              <option value="category_asc">Category (A–Z)</option>
              <option value="category_desc">Category (Z–A)</option>
              <option value="id">Complaint ID</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
              style={{ height: '40px', width: '100%' }}
            >
              Reset Filters
            </button>
          </div>
        </form>
      </div>

      {/* Complaints Data Table */}
      <div className="table-responsive" style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
        <table className="civic-table">
          <thead>
            <tr>
              <th>Reference ID</th>
              <th>Category</th>
              <th>Title / Location</th>
              <th>Ward</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Community Net Score</th>
              <th>Filing Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Loading complaints from civic registry...
                </td>
              </tr>
            ) : complaints.length > 0 ? (
              complaints.map((c) => {
                const score = c.netScore !== undefined ? c.netScore : (c.upvotesCount || 0) - (c.downvotesCount || 0);
                return (
                  <tr key={c._id}>
                    <td>
                      <Link to={`/authority/complaints/${c._id}`} style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        {c.referenceId}
                      </Link>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{c.category}</span>
                    </td>
                    <td style={{ maxWidth: '220px' }}>
                      <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.location}
                      </div>

                      {/* Flag Warning Tags */}
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
                    <td style={{ fontSize: '0.8125rem' }}>
                      {c.ward}
                    </td>
                    <td>
                      <StatusBadge status={c.status} size="small" />
                    </td>
                    {/* Net Score */}
                    <td style={{ textAlign: 'center' }}>
                      <span
                        title={`Net Score: ${score} (${c.upvotesCount || 0} up, ${c.downvotesCount || 0} down)`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          backgroundColor: score > 0 ? '#DCFCE7' : score < 0 ? '#FEE2E2' : 'var(--bg-card)',
                          color: score > 0 ? '#15803D' : score < 0 ? '#B91C1C' : 'var(--text-muted)',
                          fontWeight: 700,
                          fontSize: '0.8125rem'
                        }}
                      >
                        <ThumbsUp size={12} />
                        <span>{score > 0 ? `+${score}` : score}</span>
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <Link to={`/authority/complaints/${c._id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  {searchTerm ? (
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                        No complaints found matching "{searchTerm}".
                      </p>
                      <p style={{ fontSize: '0.8125rem' }}>Try a different keyword or reset filters.</p>
                    </div>
                  ) : (
                    <p>No complaints found matching the selected criteria.</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary btn-sm"
          >
            Previous
          </button>
          <span style={{ padding: '6px 12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-secondary btn-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}