import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Clock,
  Building2,
  ShieldCheck,
  Info,
  Check,
  Trash2,
  ExternalLink,
  CheckCheck,
  Filter,
  Loader2
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function NotificationsView() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const { fetchUnreadNotifications } = useAuth();
  const { showToast } = useToast();

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'unread') params.unread = 'true';
      const res = await api.getNotifications(params);
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.markNotificationRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        fetchUnreadNotifications();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update notification', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.markAllNotificationsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        fetchUnreadNotifications();
        showToast('All notifications marked as read', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to mark all as read', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.deleteNotification(id);
      if (res.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        fetchUnreadNotifications();
        showToast('Notification removed', 'info');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete notification', 'error');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'submission':
        return {
          icon: <CheckCircle2 size={18} />,
          bg: 'var(--color-accent-blue-bg, #DBEAFE)',
          color: 'var(--color-primary, #1E40AF)'
        };
      case 'assignment':
        return {
          icon: <Building2 size={18} />,
          bg: 'rgba(147, 51, 234, 0.12)',
          color: '#9333EA'
        };
      case 'status_change':
        return {
          icon: <Clock size={18} />,
          bg: 'var(--color-accent-amber-bg, #FEF3C7)',
          color: 'var(--color-accent-amber, #D97706)'
        };
      case 'resolution':
        return {
          icon: <ShieldCheck size={18} />,
          bg: 'var(--color-accent-green-bg, #DCFCE7)',
          color: 'var(--color-accent-green, #15803D)'
        };
      default:
        return {
          icon: <Info size={18} />,
          bg: 'var(--bg-subtle)',
          color: 'var(--text-muted)'
        };
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const unreadTotal = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header and Bulk Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Grievance Notifications
            </h2>
            {unreadTotal > 0 && (
              <span
                style={{
                  backgroundColor: 'var(--color-status-rejected, #DC2626)',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}
              >
                {unreadTotal} new
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Real-time updates regarding your filed civic complaints and status transitions.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadTotal === 0}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
          >
            <CheckCheck size={15} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          backgroundColor: 'var(--bg-surface)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          width: 'fit-content'
        }}
      >
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: filter === 'all' ? 600 : 500,
            border: 'none',
            backgroundColor: filter === 'all' ? 'var(--color-primary)' : 'transparent',
            color: filter === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          All Notifications
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: filter === 'unread' ? 600 : 500,
            border: 'none',
            backgroundColor: filter === 'unread' ? 'var(--color-primary)' : 'transparent',
            color: filter === 'unread' ? '#FFFFFF' : 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          Unread Only
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--color-primary)' }} />
          <p style={{ fontSize: '0.9rem' }}>Fetching notification alerts...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bell size={28} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: 0 }}>
            {filter === 'unread'
              ? 'You are all caught up! Switch to "All Notifications" to view your historical updates.'
              : 'You will receive alerts here whenever your complaints are registered, assigned to departments, or resolved.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((n) => {
            const iconConfig = getNotificationIcon(n.type);

            return (
              <div
                key={n._id}
                style={{
                  backgroundColor: n.isRead ? 'var(--bg-surface)' : 'rgba(30, 64, 175, 0.04)',
                  border: n.isRead ? '1px solid var(--border-subtle)' : '1px solid rgba(30, 64, 175, 0.25)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  position: 'relative',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {/* Type Icon Badge */}
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: iconConfig.bg,
                    color: iconConfig.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  {iconConfig.icon}
                </div>

                {/* Content */}
                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: n.isRead ? 600 : 700, color: 'var(--text-primary)', margin: 0 }}>
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-primary)',
                            display: 'inline-block'
                          }}
                          title="Unread"
                        />
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                    {n.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    {/* Complaint Reference Link */}
                    {n.referenceId ? (
                      <Link
                        to={`/complaint/${n.referenceId}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          color: 'var(--color-primary)',
                          textDecoration: 'none'
                        }}
                      >
                        <span>View Complaint ({n.referenceId})</span>
                        <ExternalLink size={12} />
                      </Link>
                    ) : <span />}

                    {/* Quick actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(n._id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '3px 6px',
                            borderRadius: '4px'
                          }}
                          title="Mark as read"
                        >
                          <Check size={12} />
                          <span>Mark read</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(n._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          padding: '3px 6px',
                          borderRadius: '4px'
                        }}
                        title="Delete notification"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
