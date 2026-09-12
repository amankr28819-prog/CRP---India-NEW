import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Building2,
  Calendar,
  FileText,
  MapPin,
  RefreshCw,
  Printer
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BackButton from '../../components/BackButton';

export default function AuthorityReports() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('All Time');

  const fetchMetrics = async (selectedRange = timeRange) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedRange && selectedRange !== 'All Time') {
        params.timeRange = selectedRange;
      }
      const res = await api.getAuthorityDashboard(params);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to fetch municipal performance reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    fetchMetrics(newRange);
  };

  useEffect(() => {
    fetchMetrics('All Time');
  }, []);

  const stats = data?.stats || {
    total: 0,
    submitted: 0,
    underReview: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    activeBacklog: 0,
    resolutionRate: 0,
    deletedCount: 0,
    avgTurnaroundHours: null,
    avgTurnaroundDisplay: 'N/A'
  };

  const totalComplaints = stats.total || 0;
  const resolutionRate = stats.resolutionRate !== undefined
    ? Math.round(stats.resolutionRate)
    : (totalComplaints > 0 ? Math.round(((stats.resolved || 0) / totalComplaints) * 100) : 0);
  const activeBacklog = stats.activeBacklog !== undefined
    ? stats.activeBacklog
    : ((stats.submitted || 0) + (stats.underReview || 0) + (stats.assigned || 0) + (stats.inProgress || 0));

  const turnaroundDisplay = stats.avgTurnaroundDisplay || (stats.avgTurnaroundHours !== null && stats.avgTurnaroundHours !== undefined ? `${stats.avgTurnaroundHours} hrs` : 'N/A');

  const departmentMetrics = data?.departmentStats || [];

  const statusItems = [
    { label: 'Submitted', count: stats.submitted || 0, color: 'var(--color-primary, #3B82F6)', bg: 'var(--color-primary-light, #EFF6FF)' },
    { label: 'Under Review', count: stats.underReview || 0, color: '#D97706', bg: 'var(--color-accent-amber-bg, #FEF3C7)' },
    { label: 'Assigned', count: stats.assigned || 0, color: '#7C3AED', bg: '#EDE9FE' },
    { label: 'In Progress', count: stats.inProgress || 0, color: '#0284C7', bg: '#E0F2FE' },
    { label: 'Resolved', count: stats.resolved || 0, color: 'var(--color-accent-green, #15803D)', bg: 'var(--color-accent-green-bg, #DCFCE7)' }
  ];

  const handlePrint = () => {
    window.print();
  };

  const jurisdictionTitle = data?.authorityScope?.scopeTitle || user?.department || (user?.assignedCategory ? `${user.assignedCategory} Division` : 'Municipal Jurisdiction');

  return (
    <div className="container" style={{ padding: '36px 20px 80px 20px' }}>
      <BackButton fallback="/authority/dashboard" label="Back to Dashboard" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
            <BarChart3 size={14} />
            <span>Municipal Authority Portal • Official Redressal Analytics</span>
          </div>
          <h1 className="page-title">Reports & Redressal Analytics</h1>
          <p className="page-subtitle">
            Comprehensive grievance throughput, department SLA adherence, and civic performance metrics for <strong>{jurisdictionTitle}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Time Range Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '6px 12px' }}>
            <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              disabled={loading}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>

          <button
            onClick={() => fetchMetrics(timeRange)}
            className="btn btn-secondary btn-sm"
            title="Refresh metrics"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-secondary btn-sm"
            title="Print or export report document"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Top Level Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '20px' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
            Overall Resolution Rate
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-accent-green)', lineHeight: 1 }}>
            {resolutionRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {stats.resolved || 0} of {totalComplaints} grievances resolved
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '20px' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
            Average Turnaround Time
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>
            {turnaroundDisplay}
          </div>
          <div style={{ fontSize: '0.75rem', color: stats.avgTurnaroundHours !== null ? 'var(--color-accent-green)' : 'var(--text-muted)', marginTop: '8px' }}>
            {stats.avgTurnaroundHours !== null ? 'Calculated from resolved grievances' : 'No resolved grievances in scope'}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '20px' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
            Active Action Backlog
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#B45309', lineHeight: 1 }}>
            {activeBacklog}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {(stats.submitted || 0)} Submitted • {(stats.underReview || 0)} Review • {(stats.assigned || 0)} Assigned • {(stats.inProgress || 0)} In Progress
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '20px' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
            Audit & Citizen Archival
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#6D28D9', lineHeight: 1 }}>
            {stats.deletedCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Withdrawn Grievances in Secure Audit Log
          </div>
        </div>
      </div>

      {/* Live Status Distribution Breakdown */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Live Status Distribution & Pipeline Throughput
        </h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Proportional breakdown of all {totalComplaints} active registered grievances across municipal lifecycle stages.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          {statusItems.map((item, idx) => {
            const pct = totalComplaints > 0 ? ((item.count / totalComplaints) * 100).toFixed(1) : '0.0';
            return (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.color }}>{pct}%</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: item.color, lineHeight: 1, marginBottom: '8px' }}>
                  {item.count}
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', backgroundColor: item.color, borderRadius: '3px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department SLA & Performance Breakdown */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Departmental Resolution & SLA Benchmark Performance
        </h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
          Direct database aggregation of grievance resolution efficiency by municipal department.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-subtle)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Municipal Department</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Grievances</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Backlog</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Resolution Efficiency</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Charter Adherence</th>
              </tr>
            </thead>
            <tbody>
              {departmentMetrics.length > 0 ? (
                departmentMetrics.map((dept, idx) => {
                  const efficiency = dept.total > 0 ? Math.round((dept.resolved / dept.total) * 100) : 0;
                  const sharePct = totalComplaints > 0 ? ((dept.total / totalComplaints) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        <div>{dept.departmentName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dept.category}</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div>{dept.total}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sharePct}% of total</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#B45309', fontWeight: 600 }}>
                        {dept.activeBacklog} active
                      </td>
                      <td style={{ padding: '14px 16px', minWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${efficiency}%`, height: '100%', backgroundColor: efficiency >= 50 ? 'var(--color-accent-green, #16A34A)' : 'var(--color-primary)' }} />
                          </div>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {dept.resolved} / {dept.total} ({efficiency}%)
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: dept.total === 0 ? 'var(--bg-subtle)' : efficiency >= 50 ? 'var(--color-accent-green-bg)' : 'var(--color-accent-amber-bg)',
                          color: dept.total === 0 ? 'var(--text-muted)' : efficiency >= 50 ? '#15803D' : '#B45309',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          {dept.total === 0 ? 'No Grievances' : efficiency >= 50 ? 'Charter Met' : 'Active Resolution'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No departmental grievances recorded for this jurisdiction.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ward Distribution Table */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Zonal & Ward Grievance Summary
        </h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Geographic grievance distribution across active administrative zones.
        </p>
        {data?.wardStats && data.wardStats.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {data.wardStats.map((w, idx) => {
              const wardPct = totalComplaints > 0 ? ((w.count / totalComplaints) * 100).toFixed(1) : '0.0';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={15} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      Ward {w._id}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {w.count} logged
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {wardPct}% of total
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No ward data currently logged.</p>
        )}
      </div>
    </div>
  );
}
