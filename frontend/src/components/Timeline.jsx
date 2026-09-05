import React, { useState } from 'react';
import {
  Check,
  Clock,
  AlertCircle,
  UserCheck,
  PlayCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
  Building,
  Calendar,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { getImageUrl } from '../services/api';

export default function Timeline({ history = [], currentStatus = null, complaint = null }) {
  const [expandedStages, setExpandedStages] = useState({});

  // Determine active status: prioritize prop, then complaint object, then latest history entry, default to 'Submitted'
  const activeStatus = currentStatus || complaint?.status || (history.length > 0 ? history[history.length - 1]?.status : 'Submitted');

  // CRP India legitimate lifecycle stages
  const STANDARD_STAGES = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];

  const isRejected = activeStatus === 'Rejected' || history.some((h) => h.status === 'Rejected');

  let stages = STANDARD_STAGES;
  if (isRejected) {
    // Show stages reached in history prior to rejection, then 'Rejected'
    const reachedBefore = ['Submitted', 'Under Review', 'Assigned', 'In Progress'].filter((st) =>
      history.some((h) => h.status === st)
    );
    stages = reachedBefore.length > 0 ? [...reachedBefore, 'Rejected'] : ['Submitted', 'Under Review', 'Rejected'];
  }

  const currentIndex = stages.indexOf(activeStatus);

  const getStageState = (stage, index) => {
    if (activeStatus === 'Resolved') {
      return 'completed';
    }
    if (stage === activeStatus) {
      return 'current';
    }
    if (currentIndex !== -1 && index < currentIndex) {
      return 'completed';
    }
    if (history.some((h) => h.status === stage && stage !== activeStatus)) {
      return 'completed';
    }
    return 'pending';
  };

  const toggleStage = (stage) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stage]: !prev[stage]
    }));
  };

  // Find most relevant history record for a given stage
  const getStageHistory = (stage) => {
    if (!history || history.length === 0) return null;
    return history.slice().reverse().find((h) => h.status === stage) || null;
  };

  return (
    <div className="complaint-timeline-tracker" style={{ width: '100%', marginTop: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {stages.map((stage, idx) => {
          const state = getStageState(stage, idx);
          const isExpanded = !!expandedStages[stage];
          const isLast = idx === stages.length - 1;
          const histEntry = getStageHistory(stage);

          // Node styling by state
          let nodeBg = 'var(--bg-surface)';
          let nodeBorder = 'var(--border-subtle)';
          let nodeColor = 'var(--text-muted)';
          let badgeText = 'Pending';
          let badgeBg = 'var(--bg-subtle)';
          let badgeColor = 'var(--text-muted)';
          let titleColor = 'var(--text-muted)';

          if (state === 'completed') {
            nodeBg = '#16A34A';
            nodeBorder = '#16A34A';
            nodeColor = '#FFFFFF';
            badgeText = 'Completed';
            badgeBg = 'rgba(22, 163, 74, 0.12)';
            badgeColor = '#16A34A';
            titleColor = 'var(--text-primary)';
          } else if (state === 'current') {
            if (stage === 'Rejected') {
              nodeBg = '#DC2626';
              nodeBorder = '#DC2626';
              nodeColor = '#FFFFFF';
              badgeText = 'Rejected';
              badgeBg = 'rgba(220, 38, 38, 0.12)';
              badgeColor = '#DC2626';
              titleColor = '#DC2626';
            } else {
              nodeBg = 'var(--color-primary, #2563EB)';
              nodeBorder = 'var(--color-primary, #2563EB)';
              nodeColor = '#FFFFFF';
              badgeText = 'Current Status';
              badgeBg = 'rgba(37, 99, 235, 0.12)';
              badgeColor = 'var(--color-primary, #2563EB)';
              titleColor = 'var(--text-primary)';
            }
          }

          // Line connector style
          const connectorColor = state === 'completed' ? '#16A34A' : 'var(--border-subtle)';

          return (
            <div key={stage} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {/* Main Timeline Row (Clean presentation of stage name + state) */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleStage(stage)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleStage(stage);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: isExpanded ? 'var(--bg-subtle)' : 'transparent',
                  border: isExpanded ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                  userSelect: 'none'
                }}
                className="timeline-stage-header"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Visual Node */}
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: nodeBg,
                      border: `2px solid ${nodeBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: nodeColor,
                      flexShrink: 0,
                      boxShadow: state === 'current' ? '0 0 0 3px rgba(37, 99, 235, 0.2)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {state === 'completed' ? (
                      <Check size={14} strokeWidth={3} />
                    ) : state === 'current' ? (
                      stage === 'Rejected' ? (
                        <XCircle size={15} strokeWidth={2.5} />
                      ) : (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
                      )
                    ) : (
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
                    )}
                  </div>

                  {/* Stage Label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontWeight: state === 'current' ? 700 : state === 'completed' ? 600 : 500,
                        fontSize: '0.925rem',
                        color: titleColor
                      }}
                    >
                      {stage}
                    </span>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: badgeBg,
                        color: badgeColor,
                        display: 'inline-flex',
                        alignItems: 'center',
                        lineHeight: 1.3
                      }}
                    >
                      {badgeText}
                    </span>
                  </div>
                </div>

                {/* Expand / Collapse Chevron */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--text-muted)',
                    fontSize: '0.78rem',
                    flexShrink: 0
                  }}
                >
                  <span style={{ display: 'none' }} className="timeline-expand-label">
                    {isExpanded ? 'Hide' : 'Details'}
                  </span>
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Expandable Dropdown / Accordion Details Panel (Controlled per stage, hidden by default) */}
              {isExpanded && (
                <div
                  style={{
                    marginLeft: '38px',
                    marginRight: '8px',
                    marginTop: '4px',
                    marginBottom: '10px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.825rem',
                    color: 'var(--text-primary)',
                    animation: 'fadeIn 0.15s ease'
                  }}
                  className="timeline-stage-details"
                >
                  {state === 'pending' ? (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-muted)' }}>
                      <Clock size={15} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong>Pending Civic Action:</strong> This stage has not been reached yet. It will activate once the civic authority proceeds to this milestone.
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {/* Timestamp */}
                      {(histEntry?.timestamp || (stage === 'Submitted' && complaint?.createdAt) || (stage === 'Resolved' && complaint?.resolvedAt)) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {stage === 'Submitted' ? 'Submitted on: ' : stage === 'Resolved' ? 'Resolved on: ' : 'Updated on: '}
                            </span>
                            <strong style={{ color: 'var(--text-primary)' }}>
                              {new Date(
                                histEntry?.timestamp ||
                                  (stage === 'Resolved' && complaint?.resolvedAt) ||
                                  complaint?.createdAt
                              ).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </strong>
                          </div>
                        </div>
                      )}

                      {/* Updated By / Actor */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {stage === 'Submitted' ? 'Submitted by: ' : 'Handled by: '}
                          </span>
                          <strong style={{ color: 'var(--text-primary)' }}>
                            {histEntry?.changedBy ||
                              (stage === 'Submitted'
                                ? (complaint?.citizen?.name || 'Citizen Complainant')
                                : stage === 'Resolved' && complaint?.resolvedBy
                                ? complaint.resolvedBy
                                : 'Civic Authority Desk')}
                          </strong>
                        </div>
                      </div>

                      {/* Assigned stage specific details */}
                      {stage === 'Assigned' && (complaint?.assignedDepartment || complaint?.assignedOfficer) && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <Building size={14} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
                          <div>
                            {complaint?.assignedDepartment && (
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Assigned Department: </span>
                                <strong>{complaint.assignedDepartment}</strong>
                              </div>
                            )}
                            {complaint?.assignedOfficer && complaint.assignedOfficer !== 'Unassigned' && (
                              <div>
                                <span style={{ color: 'var(--text-muted)' }}>Assigned Officer: </span>
                                <strong>{complaint.assignedOfficer}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Remarks / Description */}
                      {(histEntry?.remark || (stage === 'Submitted' && complaint?.description)) && (
                        <div
                          style={{
                            marginTop: '4px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-subtle)',
                            borderLeft: `3px solid ${state === 'current' ? 'var(--color-primary)' : '#16A34A'}`
                          }}
                        >
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 600 }}>
                            {stage === 'Submitted' ? 'Initial Intake / Summary' : 'Officer Remarks / Notes'}
                          </div>
                          <div style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                            {histEntry?.remark || complaint?.description}
                          </div>
                        </div>
                      )}

                      {/* Resolution specific notes & photo */}
                      {stage === 'Resolved' && (complaint?.resolutionNote || complaint?.resolutionPhoto) && (
                        <div style={{ marginTop: '4px' }}>
                          {complaint.resolutionNote && (
                            <div style={{ marginBottom: '6px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Resolution Summary: </span>
                              <strong>{complaint.resolutionNote}</strong>
                            </div>
                          )}
                          {complaint.resolutionPhoto && (
                            <div style={{ marginTop: '6px' }}>
                              <a
                                href={getImageUrl(complaint.resolutionPhoto)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: '0.78rem',
                                  color: 'var(--color-primary)',
                                  textDecoration: 'none',
                                  fontWeight: 600
                                }}
                              >
                                View Official Resolution Proof Photo
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Vertical connector line between stages */}
              {!isLast && (
                <div
                  style={{
                    position: 'relative',
                    left: '24px',
                    width: '2px',
                    height: '14px',
                    backgroundColor: connectorColor,
                    margin: '1px 0',
                    borderRadius: '1px'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}