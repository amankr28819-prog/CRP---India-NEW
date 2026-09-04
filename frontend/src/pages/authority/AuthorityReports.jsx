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

  const fetchMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAuthorityDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to fetch municipal performance reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const stats = data?.stats || {
    total: 0,
    submitted: 0,
    underReview: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0
  };

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const activeBacklog = stats.submitted + stats.underReview + stats.assigned + stats.inProgress;

  const departmentMetrics = [
    { name: 'Public Works Department (Roads)', resolved: 88, avgTime: '34 hrs', rating: '94% SLA Met' },
    { name: 'Solid Waste & Sanitation Department', resolved: 92, avgTime: '18 hrs', rating: '97% SLA Met' },
    { name: 'Municipal Electrical & Lighting Division', resolved: 84, avgTime: '26 hrs', rating: '91% SLA Met' },
    { name: 'Water Supply & Jal Board', resolved: 79, avgTime: '42 hrs', rating: '88% SLA Met' },
    { name: 'Stormwater Drainage & Sewerage Board', resolved: 76, avgTime: '48 hrs', rating: '85% SLA Met' },
    { name: 'Parks & Public Amenities Directorate', resolved: 95, avgTime: '22 hrs', rating: '99% SLA Met' }
  ];

  const handlePrint = () => {
    window.print();
  };

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
            Comprehensive grievance throughput, department SLA adherence, and civic performance metrics for <strong>Bengaluru Municipal Region</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={fetchMetrics}
            className="btn btn-secondary btn-sm"
            title="Refresh metrics"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
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
            {stats.resolved} of {stats.total} grievances resolved
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '20px' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
            Average Turnaround Time
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)', lineHeight: 1 }}>
            34.5 hrs
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-accent-green)', marginTop: '8px' }}>
            Within 48-Hour Citizen Charter SLA
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
            Submitted, Under Review, or In Progress
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '20px' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
            Official Audit Compliance
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#6D28D9', lineHeight: 1 }}>
            99.2%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            GPS & Photo Verified Milestones
          </div>
        </div>
      </div>

      {/* Department SLA & Performance Breakdown */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '18px' }}>
          Departmental Resolution & SLA Benchmark Performance
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-subtle)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Municipal Department</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Resolution Efficiency</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>Avg Redressal Time</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-secondary)' }}>Charter Adherence</th>
              </tr>
            </thead>
            <tbody>
              {departmentMetrics.map((dept, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {dept.name}
                  </td>
                  <td style={{ padding: '14px 16px', minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${dept.resolved}%`, height: '100%', backgroundColor: 'var(--color-primary)' }} />
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{dept.resolved}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {dept.avgTime}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'var(--color-accent-green-bg)', color: '#15803D', fontSize: '0.75rem', fontWeight: 600 }}>
                      {dept.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ward Distribution Table */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Zonal & Ward Grievance Summary
        </h2>
        {data?.wardStats && data.wardStats.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {data.wardStats.map((w, idx) => (
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
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {w.count} logged
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No ward data currently logged.</p>
        )}
      </div>
    </div>
  );
}
