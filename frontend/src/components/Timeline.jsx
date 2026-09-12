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
  Copy,
  RotateCcw,
  ArrowRight,
  History as HistoryIcon
} from 'lucide-react';
import { getImageUrl } from '../services/api';

export default function Timeline({ history = [], currentStatus = null, complaint = null }) {
  const [expandedStages, setExpandedStages] = useState({});
  const [showFullHistory, setShowFullHistory] = useState(true);

  // 1. Determine active status strictly: prioritize prop, then complaint object, then latest history entry
  const activeStatus = currentStatus || complaint?.status || (history.length > 0 ? history[history.length - 1]?.status : 'Submitted');

  // CRP India legitimate lifecycle stages
  const STANDARD_STAGES = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];

  // Current status determines whether a terminal or administrative stage is active
  const isRejected = activeStatus === 'Rejected';
  const isDuplicate = activeStatus === 'Duplicate' || (activeStatus === 'Duplicate' && complaint?.flagStatus === 'duplicate');
  const isMisinformation = activeStatus === 'Misinformation' || (activeStatus === 'Misinformation' && complaint?.flagStatus === 'misinformation');

  // Stages for the Current Progression Tracker
  let stages = STANDARD_STAGES;
  if (isRejected) {
    const reachedBefore = ['Submitted', 'Under Review', 'Assigned', 'In Progress'].filter((st) =>
      history.some((h) => h.status === st)
    );
    stages = reachedBefore.length > 0 ? [...reachedBefore, 'Rejected'] : ['Submitted', 'Under Review', 'Rejected'];
  } else if (isDuplicate) {
    const reachedBefore = ['Submitted', 'Under Review', 'Assigned', 'In Progress'].filter((st) =>
      history.some((h) => h.status === st)
    );
    stages = reachedBefore.length > 0 ? [...reachedBefore, 'Duplicate'] : ['Submitted', 'Duplicate'];
  } else if (isMisinformation) {
    const reachedBefore = ['Submitted', 'Under Review', 'Assigned', 'In Progress'].filter((st) =>
      history.some((h) => h.status === st)
    );
    stages = reachedBefore.length > 0 ? [...reachedBefore, 'Misinformation'] : ['Submitted', 'Misinformation'];
  }

  const currentIndex = stages.indexOf(activeStatus);

  // 2. Progression status rule: calculated strictly relative to CURRENT status.
  // Previous stages reached in history DO NOT mark upcoming stages as completed.
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
    return 'pending';
  };

  const toggleStage = (stage) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stage]: prev[stage] !== undefined ? !prev[stage] : false
    }));
  };

  // Find most relevant/latest history record for a given stage
  const getStageHistory = (stage) => {
    if (history && history.length > 0) {
      const match = history.slice().reverse().find((h) => h.status === stage);
      if (match) return match;
    }
    // Fallback for Duplicate / Misinformation if legacy flagDetails exists
    if ((stage === 'Duplicate' || stage === 'Misinformation') && complaint?.flagDetails) {
      return {
        status: stage,
        changedBy: complaint.flagDetails.flaggedBy || 'Civic Authority Officer',
        department: complaint.assignedDepartment || 'Municipal Authority',
        remark: complaint.flagDetails.reason || complaint.flagDetails.explanation || '',
        timestamp: complaint.flagDetails.flaggedAt
      };
    }
    return null;
  };

  // Check if a stage was reached previously in history but is currently pending due to rollback
  const wasPreviouslyReached = (stage) => {
    return history.some((h) => h.status === stage);
  };

  // Helper to detect backward/rollback transitions
  const isBackwardTransition = (prev, next) => {
    const stageRank = {
      'Submitted': 0,
      'Under Review': 1,
      'Assigned': 2,
      'In Progress': 3,
      'Resolved': 4
    };
    if (prev && next && stageRank[prev] !== undefined && stageRank[next] !== undefined) {
      return stageRank[prev] > stageRank[next];
    }
    if (['Rejected', 'Duplicate', 'Misinformation'].includes(prev) && ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(next)) {
      return true;
    }
    return false;
  };

  // Format date/time helper in Indian standard
  const formatDateTime = (dateVal) => {
    if (!dateVal) return 'Date not recorded';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Normalize chronological history list
  const chronologicalHistory = React.useMemo(() => {
    if (!history || history.length === 0) {
      if (complaint?.createdAt) {
        return [{
          status: 'Submitted',
          previousStatus: '',
          changedBy: complaint.citizen?.name || 'Citizen Complainant',
          department: complaint.department || complaint.assignedDepartment || 'Intake Portal',
          remark: complaint.description || 'Grievance submitted by citizen.',
          timestamp: complaint.createdAt
        }];
      }
      return [];
    }
    return [...history];
  }, [history, complaint]);

  return (
    <div className="complaint-timeline-tracker" style={{ width: '100%', marginTop: '8px' }}>
      {/* SECTION 1: Current Progression Timeline */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Current Progression
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Stage: {activeStatus}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: isRejected || isMisinformation ? 'rgba(220, 38, 38, 0.12)' : isDuplicate ? 'rgba(217, 119, 6, 0.12)' : activeStatus === 'Resolved' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                  color: isRejected || isMisinformation ? '#DC2626' : isDuplicate ? '#D97706' : activeStatus === 'Resolved' ? '#16A34A' : 'var(--color-primary, #2563EB)'
                }}
              >
                ● Active State
              </span>
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Click any stage to view details
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {stages.map((stage, idx) => {
            const state = getStageState(stage, idx);
            const isExpanded = expandedStages[stage] !== undefined ? !!expandedStages[stage] : (state === 'current' || stage === 'Duplicate' || stage === 'Misinformation');
            const isLast = idx === stages.length - 1;
            const histEntry = getStageHistory(stage);
            const wasReachedEarlier = state === 'pending' && wasPreviouslyReached(stage);

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
              badgeText = 'Completed ✓';
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
              } else if (stage === 'Misinformation') {
                nodeBg = '#DC2626';
                nodeBorder = '#DC2626';
                nodeColor = '#FFFFFF';
                badgeText = 'Misinformation';
                badgeBg = 'rgba(220, 38, 38, 0.12)';
                badgeColor = '#DC2626';
                titleColor = '#DC2626';
              } else if (stage === 'Duplicate') {
                nodeBg = '#D97706';
                nodeBorder = '#D97706';
                nodeColor = '#FFFFFF';
                badgeText = 'Duplicate';
                badgeBg = 'rgba(217, 119, 6, 0.12)';
                badgeColor = '#D97706';
                titleColor = '#D97706';
              } else {
                nodeBg = 'var(--color-primary, #2563EB)';
                nodeBorder = 'var(--color-primary, #2563EB)';
                nodeColor = '#FFFFFF';
                badgeText = 'Current Stage ●';
                badgeBg = 'rgba(37, 99, 235, 0.12)';
                badgeColor = 'var(--color-primary, #2563EB)';
                titleColor = 'var(--text-primary)';
              }
            } else {
              // Pending / Upcoming
              if (wasReachedEarlier) {
                badgeText = 'Upcoming (Previously Reached)';
                badgeBg = 'rgba(217, 119, 6, 0.1)';
                badgeColor = '#D97706';
              } else {
                badgeText = 'Upcoming';
              }
            }

            // Line connector style
            const connectorColor = state === 'completed' ? '#16A34A' : 'var(--border-subtle)';

            return (
              <div key={stage} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {/* Main Timeline Row */}
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
                    padding: '9px 12px',
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
                        boxShadow: state === 'current'
                          ? `0 0 0 3px ${stage === 'Misinformation' || stage === 'Rejected' ? 'rgba(220, 38, 38, 0.2)' : stage === 'Duplicate' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(37, 99, 235, 0.2)'}`
                          : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {state === 'completed' ? (
                        <Check size={14} strokeWidth={3} />
                      ) : state === 'current' ? (
                        stage === 'Rejected' || stage === 'Misinformation' ? (
                          <XCircle size={15} strokeWidth={2.5} />
                        ) : stage === 'Duplicate' ? (
                          <Copy size={13} strokeWidth={2.5} />
                        ) : (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
                        )
                      ) : wasReachedEarlier ? (
                        <RotateCcw size={13} strokeWidth={2.5} style={{ color: '#D97706' }} />
                      ) : (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
                      )}
                    </div>

                    {/* Stage Label & Badge */}
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
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Expandable Dropdown / Accordion Details Panel */}
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {wasReachedEarlier ? (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#B45309' }}>
                            <RotateCcw size={15} style={{ marginTop: '2px', flexShrink: 0 }} />
                            <div>
                              <strong>Previously Reached Stage:</strong> This stage was achieved in prior civic handling, but the complaint was subsequently moved back to <strong>{activeStatus}</strong> by the civic authority. See the complete audit trail below for dates, actors, and remarks.
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-muted)' }}>
                            <Clock size={15} style={{ marginTop: '2px', flexShrink: 0 }} />
                            <div>
                              <strong>Pending Civic Action:</strong> This stage has not been reached yet. It will activate once the civic authority proceeds to this milestone.
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Timestamp */}
                        {(histEntry?.timestamp || (stage === 'Submitted' && complaint?.createdAt) || (stage === 'Resolved' && complaint?.resolvedAt)) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>
                                {stage === 'Submitted'
                                  ? 'Submitted on: '
                                  : stage === 'Resolved'
                                  ? 'Resolved on: '
                                  : stage === 'Duplicate'
                                  ? 'Marked Duplicate on: '
                                  : stage === 'Misinformation'
                                  ? 'Marked Misinformation on: '
                                  : 'Updated on: '}
                              </span>
                              <strong style={{ color: 'var(--text-primary)' }}>
                                {formatDateTime(
                                  histEntry?.timestamp ||
                                    (stage === 'Resolved' && complaint?.resolvedAt) ||
                                    complaint?.createdAt
                                )}
                              </strong>
                            </div>
                          </div>
                        )}

                        {/* Updated By / Actor */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {stage === 'Submitted' ? 'Submitted by: ' : 'Officer: '}
                            </span>
                            <strong style={{ color: 'var(--text-primary)' }}>
                              {histEntry?.changedBy ||
                                (stage === 'Submitted'
                                  ? (complaint?.citizen?.name || 'Citizen Complainant')
                                  : stage === 'Resolved' && complaint?.resolvedBy
                                  ? complaint.resolvedBy
                                  : 'Civic Authority Officer')}
                            </strong>
                          </div>
                        </div>

                        {/* Department */}
                        {(histEntry?.department || complaint?.assignedDepartment) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Department: </span>
                              <strong style={{ color: 'var(--text-primary)' }}>
                                {histEntry?.department || complaint?.assignedDepartment}
                              </strong>
                            </div>
                          </div>
                        )}

                        {/* Assigned stage specific details */}
                        {stage === 'Assigned' && (
                          <>
                            {complaint?.assignedOfficer && complaint.assignedOfficer !== 'Unassigned' && (
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <User size={14} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
                                <div>
                                  <span style={{ color: 'var(--text-muted)' }}>Assigned Officer: </span>
                                  <strong>{complaint.assignedOfficer}</strong>
                                </div>
                              </div>
                            )}
                            {complaint?.assignmentInstruction && (
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '2px' }}>
                                <FileText size={14} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
                                <div>
                                  <span style={{ color: 'var(--text-muted)' }}>Assignment Instruction: </span>
                                  <strong style={{ fontStyle: 'italic' }}>"{complaint.assignmentInstruction}"</strong>
                                </div>
                              </div>
                            )}
                          </>
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
                              borderLeft: `3px solid ${
                                stage === 'Misinformation' || stage === 'Rejected'
                                  ? '#DC2626'
                                  : stage === 'Duplicate'
                                  ? '#D97706'
                                  : state === 'current'
                                  ? 'var(--color-primary)'
                                  : '#16A34A'
                              }`
                            }}
                          >
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 600 }}>
                              {stage === 'Submitted'
                                ? 'Initial Intake / Summary'
                                : stage === 'Duplicate'
                                ? 'Duplicate Grievance Remark / Reason'
                                : stage === 'Misinformation'
                                ? 'Misinformation Grievance Remark / Reason'
                                : 'Officer Remarks / Notes'}
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

      {/* SECTION 2: Status History & Audit Trail */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowFullHistory(!showFullHistory)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowFullHistory(!showFullHistory);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HistoryIcon size={18} style={{ color: 'var(--color-primary, #2563EB)' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Status History & Audit Trail
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Complete chronological record of all transitions, assignments, and rollbacks ({chronologicalHistory.length} {chronologicalHistory.length === 1 ? 'event' : 'events'})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span>{showFullHistory ? 'Collapse' : 'Expand'}</span>
            {showFullHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>

        {showFullHistory && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chronologicalHistory.map((item, index) => {
              const isBackward = isBackwardTransition(item.previousStatus, item.status);
              const isLatest = index === chronologicalHistory.length - 1;

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: isBackward ? 'rgba(217, 119, 6, 0.04)' : isLatest ? 'rgba(37, 99, 235, 0.04)' : 'var(--bg-subtle)',
                    border: `1px solid ${isBackward ? 'rgba(217, 119, 6, 0.3)' : isLatest ? 'rgba(37, 99, 235, 0.3)' : 'var(--border-subtle)'}`,
                    position: 'relative'
                  }}
                >
                  {/* Top Bar: Badges & Timestamp */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Transition / Status Tag */}
                      {item.previousStatus && item.previousStatus !== item.status ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: isBackward ? 'rgba(217, 119, 6, 0.14)' : 'rgba(37, 99, 235, 0.12)',
                            color: isBackward ? '#B45309' : 'var(--color-primary, #2563EB)'
                          }}
                        >
                          <span>{item.previousStatus}</span>
                          <ArrowRight size={12} strokeWidth={2.5} />
                          <span>{item.status}</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(37, 99, 235, 0.12)',
                            color: 'var(--color-primary, #2563EB)'
                          }}
                        >
                          {item.status}
                        </span>
                      )}

                      {/* Backward Transition Indicator */}
                      {isBackward && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            border: '1px solid #FCD34D'
                          }}
                        >
                          <RotateCcw size={11} strokeWidth={2.5} />
                          Reverted / Moved Back
                        </span>
                      )}

                      {/* Latest Event Tag */}
                      {isLatest && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(22, 163, 74, 0.12)',
                            color: '#16A34A'
                          }}
                        >
                          Latest Update
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <Calendar size={13} />
                      <span>{formatDateTime(item.timestamp)}</span>
                    </div>
                  </div>

                  {/* Actor & Department line */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={13} style={{ color: 'var(--text-muted)' }} />
                      <span>
                        Action by: <strong style={{ color: 'var(--text-primary)' }}>{item.changedBy || (item.status === 'Submitted' ? (complaint?.citizen?.name || 'Citizen Complainant') : 'Civic Authority')}</strong>
                      </span>
                    </div>

                    {(item.department || complaint?.assignedDepartment) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={13} style={{ color: 'var(--text-muted)' }} />
                        <span>
                          Dept: <strong style={{ color: 'var(--text-primary)' }}>{item.department || complaint?.assignedDepartment}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description / Remark */}
                  <div
                    style={{
                      marginTop: '2px',
                      fontSize: '0.825rem',
                      lineHeight: 1.5,
                      color: 'var(--text-primary)',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      wordBreak: 'break-word'
                    }}
                  >
                    {item.remark || (
                      isBackward
                        ? `Complaint was ${item.previousStatus}, but was moved back to ${item.status} by ${item.changedBy || 'Civic Authority'}.`
                        : item.status === 'Submitted'
                        ? 'Complaint registered and submitted by citizen.'
                        : `Complaint moved from ${item.previousStatus || 'initial stage'} to ${item.status} by ${item.changedBy || 'Civic Authority'}.`
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}