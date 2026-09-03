import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, RefreshCw, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { CATEGORIES } from '../CategorySelect';

export default function AuthorityComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
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
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.getComplaints(params);
      if (res.success) {
        setComplaints(res.complaints);
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
  }, [statusFilter, categoryFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setStatusFilter('All');
    setCategoryFilter('All');
    setSearchTerm('');
    setPage(1);
  };

  return (
    <div className="container" style={{ padding: '36px 20px 80px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Link to="/authority/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-primary)', marginBottom: '8px' }}>
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="page-title">Grievance Management Registry</h1>
          <p className="page-subtitle">
            Showing {complaints.length} of {totalCount} municipal grievances
          </p>
        </div>

        <button onClick={fetchComplaints} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} />
          <span>Refresh List</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
          {/* Keyword Search */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>Search Reference / Keyword</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g. CRP-2026-00101 or Indiranagar"
                className="form-input"
                style={{ fontSize: '0.875rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Search size={15} />
              </button>
            </div>
          </div>

          {/* Status Filter */}
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
              <option value="Submitted">Submitted</option>
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
      <div className="table-responsive" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <table className="civic-table">
          <thead>
            <tr>
              <th>Reference ID</th>
              <th>Category</th>
              <th>Title / Location</th>
              <th>Ward</th>
              <th>Assigned Department</th>
              <th>Status</th>
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
              complaints.map((c) => (
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
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {c.ward}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {c.assignedDepartment || 'Unallocated'}
                  </td>
                  <td>
                    <StatusBadge status={c.status} size="small" />
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
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No complaints found matching the selected filters.
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