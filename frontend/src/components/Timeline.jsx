import React from 'react';
import { CheckCircle2, Clock, AlertCircle, UserCheck, PlayCircle, XCircle } from 'lucide-react';

export default function Timeline({ history = [] }) {
  if (!history || history.length === 0) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No status updates recorded yet.</p>;
  }

  const getIcon = (status) => {
    switch (status) {
      case 'Submitted': return Clock;
      case 'Under Review': return AlertCircle;
      case 'Assigned': return UserCheck;
      case 'In Progress': return PlayCircle;
      case 'Resolved': return CheckCircle2;
      case 'Rejected': return XCircle;
      default: return Clock;
    }
  };

  const getColor = (status) => {
    switch (status) {
      case 'Submitted': return '#2563EB';
      case 'Under Review': return '#D97706';
      case 'Assigned': return '#7C3AED';
      case 'In Progress': return '#0284C7';
      case 'Resolved': return '#16A34A';
      case 'Rejected': return '#DC2626';
      default: return '#64748B';
    }
  };

  return (
    <div style={{ position: 'relative', paddingLeft: '28px', marginTop: '16px' }}>
      {/* Vertical connector line */}
      <div
        style={{
          position: 'absolute',
          left: '11px',
          top: '10px',
          bottom: '10px',
          width: '2px',
          backgroundColor: 'var(--border-subtle)'
        }}
      />

      {history.map((step, idx) => {
        const Icon = getIcon(step.status);
        const color = getColor(step.status);
        const isLatest = idx === history.length - 1;

        return (
          <div
            key={idx}
            style={{
              position: 'relative',
              marginBottom: idx === history.length - 1 ? 0 : '24px'
            }}
          >
            {/* Timeline node icon */}
            <div
              style={{
                position: 'absolute',
                left: '-28px',
                top: '0',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface)',
                border: `2px solid ${color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                boxShadow: isLatest ? '0 0 0 4px rgba(37, 99, 235, 0.15)' : 'none'
              }}
            >
              <Icon size={12} strokeWidth={2.5} />
            </div>

            {/* Content */}
            <div style={{ paddingLeft: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  {step.status}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(step.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Updated by: <strong>{step.changedBy || 'Civic Authority Desk'}</strong>
              </div>

              {step.remark && (
                <div
                  style={{
                    marginTop: '6px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: '4px',
                    fontSize: '0.8125rem',
                    color: 'var(--text-primary)',
                    borderLeft: `3px solid ${color}`
                  }}
                >
                  {step.remark}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}