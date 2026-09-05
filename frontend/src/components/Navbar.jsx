import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ShieldAlert,
  User,
  UserCheck,
  LogOut,
  Building2,
  ArrowRight,
  ChevronDown,
  FileText,
  Bell,
  Settings,
  Lock,
  HelpCircle,
  ShieldCheck,
  Users
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';
import crpLogo from '../assets/crp-logo.png';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const accountDropdownRef = useRef(null);
  const mobileAccountRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAuthority, requestLogout, requestPortalSwitch, selectPortal, unreadNotificationsCount } = useAuth();

  // Hover handlers with debounce grace period to allow smooth mouse transition
  const handleDropdownMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setAccountDropdownOpen(true);
  };

  const handleDropdownMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setAccountDropdownOpen(false);
    }, 180);
  };

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) {
        setAccountDropdownOpen(false);
      }
      if (
        mobileAccountRef.current &&
        !mobileAccountRef.current.contains(e.target) &&
        !e.target.closest('.mobile-account-btn')
      ) {
        setMobileAccountOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAccountDropdownOpen(false);
        setMobileMenuOpen(false);
        setMobileAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
    setMobileAccountOpen(false);
  }, [location.pathname]);

  const isAuthorityMode = location.pathname.startsWith('/authority');

  const handleCitizenPortalClick = () => {
    if (isAuthenticated && isAuthority) {
      requestPortalSwitch();
    } else {
      navigate('/home');
    }
  };

  const handleLogout = () => {
    requestLogout();
  };

  const citizenNavLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Report an Issue', path: '/report' },
    { name: 'Track Complaint', path: '/track' },
    { name: 'About', path: '/about' }
  ];

  const authorityNavLinks = [
    { name: 'Dashboard', path: '/authority/dashboard' },
    { name: 'Complaints', path: '/authority/complaints' },
    { name: 'Assigned Complaints', path: '/authority/assigned' },
    { name: 'Reports & Analytics', path: '/authority/reports' }
  ];

  const isCitizenActive = (path) => {
    if (path === '/home' && location.pathname === '/home') return true;
    if (path !== '/home' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isAuthorityActive = (path) => {
    if (path === '/authority/dashboard') {
      return location.pathname === '/authority/dashboard';
    }
    if (path === '/authority/complaints') {
      return (
        location.pathname === '/authority/complaints' ||
        (location.pathname.startsWith('/authority/complaints/') && !location.pathname.startsWith('/authority/assigned'))
      );
    }
    if (path === '/authority/assigned') {
      return location.pathname === '/authority/assigned';
    }
    if (path === '/authority/reports') {
      return location.pathname === '/authority/reports';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 50 }}>
      {/* Top Utility Bar (Role Switcher only) */}
      <div className="gov-top-bar">
        <div className="container" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              if (isAuthenticated && isAuthority) {
                requestPortalSwitch();
              } else {
                navigate('/');
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              textDecoration: 'underline'
            }}
          >
            <Building2 size={12} />
            <span>Change Portal / Role</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container navbar-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        {/* Brand */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="navbar-brand-link"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', cursor: 'pointer', minWidth: 'max-content', flexShrink: 0 }}
          title="Return to Portal Selection"
        >
          <img
            src={crpLogo}
            alt="CRP India Logo"
            className="navbar-brand-logo"
            style={{
              height: '44px',
              width: 'auto',
              maxHeight: '44px',
              objectFit: 'contain',
              borderRadius: '4px',
              display: 'block',
              flexShrink: 0
            }}
          />
          <div style={{ minWidth: 'max-content', flexShrink: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
              CRP India
            </div>
            <div className="brand-subtitle" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {isAuthorityMode ? 'Municipal Authority' : 'Civic Reporting Platform'}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '28px' }} className="desktop-nav">
          {isAuthorityMode ? (
            authorityNavLinks.map((link) => {
              const active = isAuthorityActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? 'var(--color-primary)' : 'var(--text-primary)',
                    borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
                    padding: '6px 0',
                    transition: 'color 0.15s ease'
                  }}
                >
                  {link.name}
                </Link>
              );
            })
          ) : (
            citizenNavLinks.map((link) => {
              const isReport = link.path === '/report';
              const isTrack = link.path === '/track';
              const isProtected = isReport || isTrack;
              const targetTo = !isAuthenticated && isProtected ? '/login' : link.path;
              const targetState = !isAuthenticated && isProtected ? {
                from: link.path,
                message: isTrack
                  ? 'Please log in or register to track your complaints.'
                  : 'Please log in or register to report a civic issue.'
              } : undefined;
              const active = isCitizenActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={targetTo}
                  state={targetState}
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: active ? 600 : 500,
                    color: active ? 'var(--color-primary)' : 'var(--text-primary)',
                    borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
                    padding: '6px 0',
                    transition: 'color 0.15s ease'
                  }}
                >
                  {link.name}
                </Link>
              );
            })
          )}
        </nav>

        {/* Right Desktop Actions */}
        {isAuthorityMode ? (
          <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="desktop-actions">
            <ThemeToggle />

            {/* Citizen Portal Switcher */}
            <button
              type="button"
              onClick={handleCitizenPortalClick}
              className="btn btn-secondary btn-sm"
              title="Switch to Citizen Portal"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
                fontWeight: 500,
                fontSize: '0.8125rem',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Users size={14} style={{ color: 'var(--color-primary)' }} />
              <span>Citizen Portal</span>
            </button>

            {/* Logged-in authority officer info and Sign Out */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500
                  }}
                  title={user?.email || user?.name}
                >
                  {user?.name?.split(' ')[0] || user?.name || 'Officer'}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  title="Sign Out"
                  style={{ padding: '6px 10px' }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link to="/authority/login" className="btn btn-secondary btn-sm">
                <Building2 size={14} />
                <span>Officer Sign In</span>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="desktop-actions">
            <ThemeToggle />

            {/* Authority Portal Link / Indicator */}
            {isAuthority ? (
              <Link to="/authority/dashboard" className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--color-primary)' }}>
                <Building2 size={15} style={{ color: 'var(--color-primary)' }} />
                <span>Authority Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/authority/login"
                className="btn btn-secondary btn-sm"
                title="Official Municipal Officers Portal"
                style={{ fontSize: '0.8125rem' }}
              >
                <Building2 size={14} />
                <span>Authority Portal</span>
              </Link>
            )}

            {/* Citizen Login / Account Dropdown */}
            {isAuthenticated ? (
              <div
                style={{ position: 'relative' }}
                ref={accountDropdownRef}
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  aria-expanded={accountDropdownOpen}
                  aria-label="Citizen account menu"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 10px 4px 6px',
                    borderRadius: '24px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: accountDropdownOpen ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Avatar / Initials with Notification Badge */}
                  <div style={{ position: 'relative', width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                    {user?.avatar ? (
                      <img
                        src={getImageUrl(user.avatar)}
                        alt={user?.name || 'Account'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'var(--color-primary)',
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {(user?.name || 'C')[0].toUpperCase()}
                      </div>
                    )}

                    {unreadNotificationsCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-1px',
                          right: '-1px',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-status-rejected, #DC2626)',
                          border: '1.5px solid var(--bg-surface)'
                        }}
                        title={`${unreadNotificationsCount} unread notifications`}
                      />
                    )}
                  </div>

                  <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name?.split(' ')[0] || 'Citizen'}
                  </span>

                  <ChevronDown
                    size={14}
                    style={{
                      color: 'var(--text-muted)',
                      transform: accountDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s ease'
                    }}
                  />
                </button>

                {/* Account Dropdown Card */}
                {accountDropdownOpen && (
                  <div
                    className="account-dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '270px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      boxShadow: 'var(--shadow-md)',
                      zIndex: 100,
                      overflow: 'hidden'
                    }}
                  >
                    {/* Header Profile Summary */}
                    <div
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                          {user?.avatar ? (
                            <img
                              src={getImageUrl(user.avatar)}
                              alt={user?.name || 'Avatar'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'var(--color-primary)',
                                color: '#FFFFFF',
                                fontSize: '1rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {(user?.name || 'C')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email}
                          </div>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              marginTop: '4px',
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'var(--color-accent-green-bg, #DCFCE7)',
                              color: 'var(--color-accent-green, #15803D)'
                            }}
                          >
                            <ShieldCheck size={10} /> Verified Citizen
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Options (8 Items) */}
                    <div style={{ padding: '6px' }}>
                      <Link
                        to="/account/profile"
                        onClick={() => setAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          fontWeight: 500
                        }}
                        className="nav-dropdown-item"
                      >
                        <User size={15} style={{ color: 'var(--text-muted)' }} />
                        <span>Personal Information</span>
                      </Link>

                      <Link
                        to="/account/complaints"
                        onClick={() => setAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          fontWeight: 500
                        }}
                        className="nav-dropdown-item"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FileText size={15} style={{ color: 'var(--text-muted)' }} />
                          <span>My Complaints</span>
                        </div>
                      </Link>

                      <Link
                        to="/account/notifications"
                        onClick={() => setAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          fontWeight: 500
                        }}
                        className="nav-dropdown-item"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Bell size={15} style={{ color: 'var(--text-muted)' }} />
                          <span>Notifications</span>
                        </div>
                        {unreadNotificationsCount > 0 && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '1px 6px',
                              borderRadius: '9999px',
                              backgroundColor: 'var(--color-status-rejected, #DC2626)',
                              color: '#FFFFFF'
                            }}
                          >
                            {unreadNotificationsCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/account/settings"
                        onClick={() => setAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          fontWeight: 500
                        }}
                        className="nav-dropdown-item"
                      >
                        <Settings size={15} style={{ color: 'var(--text-muted)' }} />
                        <span>Settings</span>
                      </Link>

                      <Link
                        to="/account/change-password"
                        onClick={() => setAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          fontWeight: 500
                        }}
                        className="nav-dropdown-item"
                      >
                        <Lock size={15} style={{ color: 'var(--text-muted)' }} />
                        <span>Change Password</span>
                      </Link>

                      <Link
                        to="/account/support"
                        onClick={() => setAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          fontWeight: 500
                        }}
                        className="nav-dropdown-item"
                      >
                        <HelpCircle size={15} style={{ color: 'var(--text-muted)' }} />
                        <span>Help & Support</span>
                      </Link>

                      <Link
                        to="/account/privacy-security"
                        onClick={() => setAccountDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          fontWeight: 500
                        }}
                        className="nav-dropdown-item"
                      >
                        <ShieldCheck size={15} style={{ color: 'var(--text-muted)' }} />
                        <span>Privacy & Security</span>
                      </Link>

                      <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

                      <button
                        type="button"
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          handleLogout();
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'none',
                          fontSize: '0.85rem',
                          color: 'var(--color-status-rejected, #DC2626)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: 600
                        }}
                        className="nav-dropdown-item"
                      >
                        <LogOut size={15} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-secondary btn-sm">
                <User size={15} />
                <span>Login / Register</span>
              </Link>
            )}

            {/* Report an Issue CTA Button with restrained red indicator dot */}
            <Link
              to={!isAuthenticated ? '/login' : '/report'}
              state={!isAuthenticated ? { from: '/report', message: 'Please log in or register to report a civic issue.' } : undefined}
              className="btn btn-primary btn-sm btn-report-accent"
            >
              <span className="urgent-dot" title="Active grievance intake" />
              <span>Report an Issue</span>
            </Link>
          </div>
        )}

        {/* Mobile menu, account, and theme controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mobile-controls">
          <ThemeToggle />
          <button
            type="button"
            className={`btn btn-secondary btn-sm mobile-account-btn ${mobileAccountOpen ? 'active' : ''}`}
            onClick={() => {
              setMobileMenuOpen(false);
              setMobileAccountOpen(!mobileAccountOpen);
            }}
            aria-label="Account menu"
            aria-expanded={mobileAccountOpen}
            title="Account"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              position: 'relative',
              backgroundColor: mobileAccountOpen ? 'var(--bg-subtle)' : undefined,
              borderColor: mobileAccountOpen ? 'var(--color-primary)' : undefined
            }}
          >
            <User size={18} />
            {isAuthenticated && unreadNotificationsCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-status-rejected, #DC2626)',
                  border: '1.5px solid var(--bg-surface)'
                }}
              />
            )}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm mobile-menu-btn"
            onClick={() => {
              setMobileAccountOpen(false);
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            aria-label="Toggle navigation menu"
            style={{ padding: '6px 10px' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Account Drawer */}
      {mobileAccountOpen && (
        <div
          ref={mobileAccountRef}
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '16px 20px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: 'var(--shadow-md)'
          }}
          className="mobile-drawer mobile-account-drawer"
        >
          {isAuthenticated ? (
            isAuthority ? (
              /* Municipal Authority Authenticated Account Menu */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFFFFF',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {(user?.name || 'O')[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '1px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(37, 99, 235, 0.12)',
                        color: 'var(--color-primary)'
                      }}
                    >
                      <Building2 size={11} />
                      <span>{user?.department || 'Municipal Authority'}</span>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Link
                    to="/authority/dashboard"
                    onClick={() => setMobileAccountOpen(false)}
                    className="nav-dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 8px',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      fontWeight: 500
                    }}
                  >
                    <Building2 size={16} style={{ color: 'var(--text-muted)' }} />
                    <span>Authority Dashboard</span>
                  </Link>

                  <Link
                    to="/authority/complaints"
                    onClick={() => setMobileAccountOpen(false)}
                    className="nav-dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 8px',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      fontWeight: 500
                    }}
                  >
                    <FileText size={16} style={{ color: 'var(--text-muted)' }} />
                    <span>Grievance Management</span>
                  </Link>

                  <Link
                    to="/authority/assigned"
                    onClick={() => setMobileAccountOpen(false)}
                    className="nav-dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 8px',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      fontWeight: 500
                    }}
                  >
                    <ShieldCheck size={16} style={{ color: 'var(--text-muted)' }} />
                    <span>Assigned Complaints</span>
                  </Link>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

                  <button
                    type="button"
                    onClick={() => {
                      setMobileAccountOpen(false);
                      handleCitizenPortalClick();
                    }}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
                  >
                    <Users size={16} style={{ color: 'var(--color-primary)' }} />
                    <span>Switch to Citizen Portal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileAccountOpen(false);
                      handleLogout();
                    }}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', gap: '8px', marginTop: '6px', color: 'var(--color-status-rejected)' }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out ({user?.name?.split(' ')[0] || 'Officer'})</span>
                  </button>
                </div>
              </>
            ) : (
              /* Citizen Authenticated Account Menu */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                    {user?.avatar ? (
                      <img
                        src={getImageUrl(user.avatar)}
                        alt={user?.name || 'Avatar'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor: 'var(--color-primary)',
                          color: '#FFFFFF',
                          fontSize: '1rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {(user?.name || 'C')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '1px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--color-accent-green-bg, #DCFCE7)',
                        color: 'var(--color-accent-green, #15803D)'
                      }}
                    >
                      <ShieldCheck size={11} />
                      <span>Verified Citizen</span>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Link
                    to="/account/profile"
                    onClick={() => setMobileAccountOpen(false)}
                    className="nav-dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 8px',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      fontWeight: 500
                    }}
                  >
                    <User size={16} style={{ color: 'var(--text-muted)' }} />
                    <span>Personal Information</span>
                  </Link>

                  <Link
                    to="/account/complaints"
                    onClick={() => setMobileAccountOpen(false)}
                    className="nav-dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 8px',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      fontWeight: 500
                    }}
                  >
                    <FileText size={16} style={{ color: 'var(--text-muted)' }} />
                    <span>My Complaints</span>
                  </Link>

                  <Link
                    to="/account/notifications"
                    onClick={() => setMobileAccountOpen(false)}
                    className="nav-dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 8px',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      fontWeight: 500
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Bell size={16} style={{ color: 'var(--text-muted)' }} />
                      <span>Notifications</span>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '9999px',
                          backgroundColor: 'var(--color-status-rejected, #DC2626)',
                          color: '#FFFFFF'
                        }}
                      >
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/account/settings"
                    onClick={() => setMobileAccountOpen(false)}
                    className="nav-dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 8px',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      fontWeight: 500
                    }}
                  >
                    <Settings size={16} style={{ color: 'var(--text-muted)' }} />
                    <span>Account Settings</span>
                  </Link>

                  <Link
                    to="/account/change-password"
                    onClick={() => setMobileAccountOpen(false)}
                    className="nav-dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 8px',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      fontWeight: 500
                    }}
                  >
                    <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                    <span>Change Password</span>
                  </Link>

                  <Link
                    to="/account/support"
                    onClick={() => setMobileAccountOpen(false)}
                    className="nav-dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 8px',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      fontWeight: 500
                    }}
                  >
                    <HelpCircle size={16} style={{ color: 'var(--text-muted)' }} />
                    <span>Help & Support</span>
                  </Link>

                  <Link
                    to="/account/privacy-security"
                    onClick={() => setMobileAccountOpen(false)}
                    className="nav-dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 8px',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                      fontWeight: 500
                    }}
                  >
                    <ShieldCheck size={16} style={{ color: 'var(--text-muted)' }} />
                    <span>Privacy & Security</span>
                  </Link>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

                  <button
                    type="button"
                    onClick={() => {
                      setMobileAccountOpen(false);
                      handleLogout();
                    }}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', gap: '8px', marginTop: '6px', color: 'var(--color-status-rejected)' }}
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )
          ) : (
            /* Unauthenticated Mobile Account Access */
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <User size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Account Access
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Sign in to file, track and manage complaints
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileAccountOpen(false)}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                >
                  <User size={16} />
                  <span>Citizen Login</span>
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileAccountOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                >
                  <UserCheck size={16} />
                  <span>Citizen Register</span>
                </Link>

                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

                <Link
                  to="/authority/login"
                  onClick={() => setMobileAccountOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}
                >
                  <Building2 size={16} />
                  <span>Municipal Officer Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '16px 20px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
          className="mobile-drawer"
        >
          {isAuthorityMode ? (
            <>
              {authorityNavLinks.map((link) => {
                const active = isAuthorityActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      fontSize: '1rem',
                      fontWeight: active ? 600 : 500,
                      color: active ? 'var(--color-primary)' : 'var(--text-primary)',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    {link.name}
                  </Link>
                );
              })}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleCitizenPortalClick();
                  }}
                  className="btn btn-secondary"
                  style={{ width: '100%', borderColor: 'var(--border-subtle)', justifyContent: 'center' }}
                >
                  <Users size={16} style={{ color: 'var(--color-primary)' }} />
                  <span>Citizen Portal</span>
                </button>

                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out ({user?.name})</span>
                  </button>
                ) : (
                  <Link
                    to="/authority/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                  >
                    <Building2 size={16} />
                    <span>Officer Sign In</span>
                  </Link>
                )}
              </div>
            </>
          ) : (
            <>
              {citizenNavLinks.map((link) => {
                const isReport = link.path === '/report';
                const isTrack = link.path === '/track';
                const isProtected = isReport || isTrack;
                const targetTo = !isAuthenticated && isProtected ? '/login' : link.path;
                const targetState = !isAuthenticated && isProtected ? {
                  from: link.path,
                  message: isTrack
                    ? 'Please log in or register to track your complaints.'
                    : 'Please log in or register to report a civic issue.'
                } : undefined;
                const active = isCitizenActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={targetTo}
                    state={targetState}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      fontSize: '1rem',
                      fontWeight: active ? 600 : 500,
                      color: active ? 'var(--color-primary)' : 'var(--text-primary)',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    {link.name}
                  </Link>
                );
              })}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <Link
                  to={!isAuthenticated ? '/login' : '/report'}
                  state={!isAuthenticated ? { from: '/report', message: 'Please log in or register to report a civic issue.' } : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary btn-report-accent"
                  style={{ width: '100%' }}
                >
                  <span className="urgent-dot" />
                  <span>Report an Issue</span>
                </Link>

                <Link
                  to="/authority/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  <Building2 size={16} />
                  <span>Municipal Authority Portal</span>
                </Link>

                {isAuthenticated ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                    {/* Citizen Mobile Profile Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                        {user?.avatar ? (
                          <img
                            src={getImageUrl(user.avatar)}
                            alt={user?.name || 'Avatar'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: 'var(--color-primary)',
                              color: '#FFFFFF',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {(user?.name || 'C')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {user?.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user?.email}
                        </div>
                      </div>
                    </div>

                    {/* Account Links */}
                    <Link
                      to="/account/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 4px',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        textDecoration: 'none'
                      }}
                    >
                      <User size={16} style={{ color: 'var(--text-muted)' }} />
                      <span>Personal Information</span>
                    </Link>

                    <Link
                      to="/account/complaints"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 4px',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        textDecoration: 'none'
                      }}
                    >
                      <FileText size={16} style={{ color: 'var(--text-muted)' }} />
                      <span>My Complaints</span>
                    </Link>

                    <Link
                      to="/account/notifications"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 4px',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        textDecoration: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Bell size={16} style={{ color: 'var(--text-muted)' }} />
                        <span>Notifications</span>
                      </div>
                      {unreadNotificationsCount > 0 && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '9999px',
                            backgroundColor: 'var(--color-status-rejected, #DC2626)',
                            color: '#FFFFFF'
                          }}
                        >
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/account/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 4px',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        textDecoration: 'none'
                      }}
                    >
                      <Settings size={16} style={{ color: 'var(--text-muted)' }} />
                      <span>Settings</span>
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="btn btn-secondary"
                      style={{ width: '100%', marginTop: '6px', color: 'var(--color-status-rejected)' }}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                  >
                    <User size={16} />
                    <span>Citizen Login / Register</span>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes accountDropdownFadeSlide {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .account-dropdown-menu {
          animation: accountDropdownFadeSlide 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        /* Invisible hover bridge to prevent any gap flicker when moving cursor from button to menu */
        .account-dropdown-menu::before {
          content: '';
          position: absolute;
          top: -12px;
          left: 0;
          right: 0;
          height: 12px;
        }
        .nav-dropdown-item:hover {
          background-color: var(--bg-subtle) !important;
        }
        .navbar-brand-link {
          flex-shrink: 0 !important;
          min-width: max-content !important;
        }
        .navbar-brand-logo {
          flex-shrink: 0 !important;
        }
        .desktop-nav {
          flex-shrink: 0 !important;
          white-space: nowrap !important;
        }
        .desktop-actions {
          flex-shrink: 0 !important;
          white-space: nowrap !important;
        }
        @media (min-width: 1024px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-controls { display: none !important; }
          .mobile-drawer { display: none !important; }
        }
        @media (min-width: 1024px) and (max-width: 1200px) {
          .navbar-container {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          .desktop-nav {
            gap: 12px !important;
          }
          .desktop-nav a {
            font-size: 0.82rem !important;
          }
          .desktop-actions {
            gap: 6px !important;
          }
          .desktop-actions .btn-sm {
            padding: 4px 7px !important;
            gap: 4px !important;
            font-size: 0.76rem !important;
          }
        }
        @media (max-width: 640px) {
          .navbar-container {
            padding-left: 14px !important;
            padding-right: 14px !important;
          }
        }
        @media (max-width: 480px) {
          .navbar-container {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          .brand-subtitle {
            display: none !important;
          }
          .navbar-brand-logo {
            height: 38px !important;
            max-height: 38px !important;
          }
          .mobile-controls {
            gap: 6px !important;
          }
        }
      `}</style>
    </header>
  );
}