import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  AlertCircle,
  UserCheck,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import BackButton from '../components/BackButton';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getCitizenDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load citizen grievance dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="container" style={{ padding: '64px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>Loading Public Grievance Dashboard metrics...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    total: 0,
    submitted: 0,
    underReview: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0
  };

  const statCards = [
    { label: 'Total Complaints', value: stats.total, icon: FileText, color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
    { label: 'Submitted', value: stats.submitted, icon: Clock, color: '#1D4ED8', bg: 'var(--color-accent-blue-bg)' },
    { label: 'Under Review', value: stats.underReview, icon: AlertCircle, color: '#B45309', bg: 'var(--color-accent-amber-bg)' },
    { label: 'Assigned', value: stats.assigned, icon: UserCheck, color: '#6D28D9', bg: '#EDE9FE' },
    { label: 'In Progress', value: stats.inProgress, icon: PlayCircle, color: '#0369A1', bg: '#E0F2FE' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: '#15803D', bg: 'var(--color-accent-green-bg)' }
  ];

  return (
    <div className="container" style={{ padding: '36px 20px 80px 20px' }}>
      <BackButton fallback="/" />

      {/* Citizen Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
            <ShieldCheck size={14} style={{ color: 'var(--color-accent-green)' }} />
            <span>Citizen Grievance & Resolution Portal</span>
          </div>
          <h1 className="page-title">Public Grievance Dashboard</h1>
          <p className="page-subtitle">
            Welcome, <strong>{user?.name || 'Citizen'}</strong> — Real-time community grievance resolution metrics and civic transparency tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={fetchDashboard} className="btn btn-secondary btn-sm" title="Refresh metrics">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

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

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', marginBottom: '36px' }}>
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '20px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {c.label}
                </span>
                <div style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} />
                </div>
              </div>

              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                {c.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Breakdown Section: Category Distribution & Ward Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '36px' }}>
        {/* Category Breakdown */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '24px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Complaint Distribution by Category
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.categoryStats && data.categoryStats.length > 0 ? (
              data.categoryStats.map((cat, idx) => {
                const pct = stats.total > 0 ? Math.round((cat.count / stats.total) * 100) : 0;
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{cat._id}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{cat.count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--color-primary)' }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No complaint breakdown data recorded.</p>
            )}
          </div>
        </div>

        {/* Top Active Wards */}
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '24px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Top Active Wards
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data?.wardStats && data.wardStats.length > 0 ? (
              data.wardStats.map((w, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{w._id}</span>
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {w.count} {w.count === 1 ? 'grievance' : 'grievances'}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No ward data recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Complaints Table (Read-Only) */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Recent Public Complaints
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Latest civic grievances registered across municipal wards (Read-only transparency view)
            </p>
          </div>

          <Link to="/track" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span>Search by Reference ID</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="civic-table">
            <thead>
              <tr>
                <th>Reference ID</th>
                <th>Category</th>
                <th>Title / Locality</th>
                <th>Ward / City</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentComplaints && data.recentComplaints.length > 0 ? (
                data.recentComplaints.map((c) => (
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
                      <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.location}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem' }}>{c.ward}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.city}</div>
                    </td>
                    <td>
                      <StatusBadge status={c.status} size="small" />
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
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No complaints registered in system yet.
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
