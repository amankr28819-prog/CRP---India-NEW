import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  User,
  FileText,
  Bell,
  Settings,
  Lock,
  HelpCircle,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Shield,
  Layers,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, getImageUrl } from '../../services/api';
import ProfileView from './ProfileView';
import MyComplaintsView from './MyComplaintsView';
import NotificationsView from './NotificationsView';
import SettingsView from './SettingsView';
import ChangePasswordView from './ChangePasswordView';
import SupportView from './SupportView';
import PrivacySecurityView from './PrivacySecurityView';

export default function AccountLayout() {
  const location = useLocation();
  const { user, requestLogout, unreadNotificationsCount } = useAuth();

  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.getMyComplaints();
        if (res.success && res.complaints) {
          const total = res.complaints.length;
          const inProgress = res.complaints.filter(
            (c) => c.status === 'In Progress' || c.status === 'Assigned' || c.status === 'Under Review'
          ).length;
          const resolved = res.complaints.filter((c) => c.status === 'Resolved').length;
          setStats({ total, inProgress, resolved });
        }
      } catch {
        // ignore
      }
    };
    loadStats();
  }, [location.pathname]);

  const navItems = [
    {
      id: 'profile',
      name: 'Personal Information',
      path: '/account/profile',
      icon: <User size={18} />
    },
    {
      id: 'complaints',
      name: 'My Complaints',
      path: '/account/complaints',
      icon: <FileText size={18} />,
      badge: stats.total > 0 ? stats.total : null
    },
    {
      id: 'notifications',
      name: 'Notifications',
      path: '/account/notifications',
      icon: <Bell size={18} />,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
      badgeUrgent: true
    },
    {
      id: 'settings',
      name: 'Settings & Theme',
      path: '/account/settings',
      icon: <Settings size={18} />
    },
    {
      id: 'change-password',
      name: 'Change Password',
      path: '/account/change-password',
      icon: <Lock size={18} />
    },
    {
      id: 'support',
      name: 'Help & Support',
      path: '/account/support',
      icon: <HelpCircle size={18} />
    },
    {
      id: 'privacy-security',
      name: 'Privacy & Security',
      path: '/account/privacy-security',
      icon: <ShieldCheck size={18} />
    }
  ];

  const isActive = (path) => {
    if (path === '/account/profile' && (location.pathname === '/account' || location.pathname === '/account/')) {
      return true;
    }
    return location.pathname === path;
  };

  const avatarUrl = user?.avatar ? getImageUrl(user.avatar) : '';
  const userInitials = (user?.name || 'C')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="container" style={{ padding: '28px 16px 60px 16px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <Link to="/home" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
          Citizen Portal
        </Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Citizen Account</span>
      </div>

      {/* Citizen Banner Summary Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {/* Avatar */}
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden' }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name || 'Avatar'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {userInitials}
              </div>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {user?.name}
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--color-accent-green-bg, #DCFCE7)',
                  color: 'var(--color-accent-green, #15803D)'
                }}
              >
                Verified Citizen
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
              {user?.email} {user?.phone ? `• +91 ${user.phone}` : ''}
            </div>
          </div>
        </div>

        {/* Quick Citizen Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '8px',
              textAlign: 'center',
              minWidth: '90px'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Filed</div>
          </div>

          <div
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '8px',
              textAlign: 'center',
              minWidth: '90px'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-accent-amber, #D97706)' }}>
              {stats.inProgress}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>In Action</div>
          </div>

          <div
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '8px',
              textAlign: 'center',
              minWidth: '90px'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-accent-green, #15803D)' }}>
              {stats.resolved}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resolved</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar / Tabs + Active View */}
      <div className="account-grid">
        {/* Sidebar Nav (Desktop & Tablet) */}
        <aside
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            alignSelf: 'flex-start'
          }}
          className="account-sidebar"
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 12px 10px 12px' }}>
            Account Menu
          </div>

          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--color-primary)' : 'var(--text-primary)',
                  backgroundColor: active ? 'var(--color-primary-light, #EFF6FF)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: active ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      backgroundColor: item.badgeUrgent
                        ? 'var(--color-status-rejected, #DC2626)'
                        : 'var(--bg-subtle)',
                      color: item.badgeUrgent ? '#FFFFFF' : 'var(--text-secondary)'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '10px', paddingTop: '10px' }}>
            <button
              type="button"
              onClick={requestLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--color-status-rejected, #DC2626)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Content Outlet / Router */}
        <main style={{ minWidth: 0, flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfileView />} />
            <Route path="complaints" element={<MyComplaintsView />} />
            <Route path="notifications" element={<NotificationsView />} />
            <Route path="settings" element={<SettingsView />} />
            <Route path="change-password" element={<ChangePasswordView />} />
            <Route path="support" element={<SupportView />} />
            <Route path="privacy-security" element={<PrivacySecurityView />} />
            <Route path="*" element={<Navigate to="profile" replace />} />
          </Routes>
        </main>
      </div>

      <style>{`
        .account-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
        }
        @media (max-width: 860px) {
          .account-grid {
            grid-template-columns: 1fr;
          }
          .account-sidebar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
