import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, AlertCircle, Trash2, Calendar, MapPin, Building2, User, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../CategorySelect';
import BackButton from '../../components/BackButton';

export default function AuthorityDeletedComplaints() {
  const { user } = useAuth();
  const isCategoryAuth = user && user.role === 'authority_category';

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(isCategoryAuth ? user.assignedCategory : 'All');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchDeletedComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 15
      };
      if (isCategoryAuth) {
        params.category = user.assignedCategory;
      } else if (categoryFilter !== 'All') {
        params.category = categoryFilter;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await api.getDeletedComplaints(params);
      if (res.success) {
        setComplaints(res.complaints || []);
        setTotalPages(res.pages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Unable to fetch deleted complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedComplaints();
  }, [categoryFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDeletedComplaints();
  };

  const handleResetFilters = () => {
    if (!isCategoryAuth) {
      setCategoryFilter('All');
    }
    setSearchTerm('');
    setPage(1);
  };

  return (
    <div className="container" style={{ padding: '36px 20px 80px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <BackButton fallback="/authority/dashboard" label="Back to Dashboard" style={{ marginBottom: '8px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title" style={{ margin: 0 }}>Deleted Complaints Registry</h1>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--color-status-rejected, #DC2626)',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              Archived Records
            </span>
          </div>
          <p className="page-subtitle" style={{ marginTop: '4px' }}>
            {isCategoryAuth ? (
              <>Showing <strong>{complaints.length}</strong> deleted complaints for assigned department: <strong>{user.assignedCategory}</strong></>
            ) : (
              <>Showing <strong>{complaints.length}</strong> of <strong>{totalCount}</strong> grievances deleted by citizens across all municipal categories</>
            )}
          </p>
        </div>

        <button onClick={fetchDeletedComplaints} className="btn btn-secondary btn-sm">
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

          {/* Category Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8125rem' }}>
              {isCategoryAuth ? 'Assigned Category (Locked)' : 'Filter by Category'}
            </label>
            {isCategoryAuth ? (
              <input
                type="text"
                value={user.assignedCategory}
                disabled
                className="form-input"
                style={{ fontSize: '0.875rem', backgroundColor: 'var(--bg-subtle)', cursor: 'not-allowed', color: 'var(--text-secondary)' }}
              />
            ) : (
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
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            )}
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

      {/* Deleted Complaints Data Table */}
      <div className="table-responsive" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <table className="civic-table">
          <thead>
            <tr>
              <th>Reference ID</th>
              <th>Category</th>
              <th>Title / Location</th>
              <th>Citizen</th>
              <th>Original Status</th>
              <th>Assigned Department</th>
              <th>Deleted Date</th>
              <th>Current State</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  Loading deleted complaints from civic archive...
                </td>
              </tr>
            ) : complaints.length > 0 ? (
              complaints.map((c) => {
                const deletedDate = c.deletedAt
                  ? new Date(c.deletedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Recorded';

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
                        {c.location} ({c.ward}, {c.city})
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      <div style={{ fontWeight: 500 }}>{c.citizen?.name || 'Citizen'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.citizen?.email || 'N/A'}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-subtle)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <div>{c.assignedDepartment || 'Unallocated'}</div>
                      {c.assignedOfficer && c.assignedOfficer !== 'Pending Allocation' && c.assignedOfficer !== 'Unassigned' && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Officer: {c.assignedOfficer}</div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {deletedDate}
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          color: 'var(--color-status-rejected, #DC2626)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em'
                        }}
                      >
                        <Trash2 size={11} />
                        <span>Deleted by Citizen</span>
                      </span>
                    </td>
                    <td>
                      <Link to={`/authority/complaints/${c._id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        View Record
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No deleted complaints found in this category.
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
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary btn-sm"
          >
            Previous
          </button>
          <span style={{ padding: '6px 12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
