import React from 'react';
import { Clock, CheckCircle2, AlertCircle, PlayCircle, UserCheck, XCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'normal' }) {
  const normalized = status || 'Submitted';
  let badgeClass = 'badge-submitted';
  let Icon = Clock;

  switch (normalized) {
    case 'Submitted':
      badgeClass = 'badge-submitted';
      Icon = Clock;
      break;
    case 'Under Review':
      badgeClass = 'badge-review';
      Icon = AlertCircle;
      break;
    case 'Assigned':
      badgeClass = 'badge-assigned';
      Icon = UserCheck;
      break;
    case 'In Progress':
      badgeClass = 'badge-progress';
      Icon = PlayCircle;
      break;
    case 'Resolved':
      badgeClass = 'badge-resolved';
      Icon = CheckCircle2;
      break;
    case 'Rejected':
      badgeClass = 'badge-rejected';
      Icon = XCircle;
      break;
    default:
      badgeClass = 'badge-submitted';
      Icon = Clock;
  }

  const isSmall = size === 'small';

  return (
    <span
      className={`status-badge ${badgeClass}`}
      style={isSmall ? { padding: '2px 8px', fontSize: '0.75rem' } : {}}
    >
      <Icon size={isSmall ? 13 : 15} />
      <span>{normalized}</span>
    </span>
  );
}