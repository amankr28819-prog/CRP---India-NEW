import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShieldAlert, User, LogOut, Building2, ArrowRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import crpLogo from '../assets/crp-logo.png';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAuthority, requestLogout, selectPortal } = useAuth();

  const isAuthorityMode = Boolean(
    location.pathname.startsWith('/authority') || (isAuthenticated && isAuthority)
  );

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
          <Link
            to="/"
            style={{
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
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        {/* Brand */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', cursor: 'pointer' }}
          title="Return to Portal Selection"
        >
          <img
            src={crpLogo}
            alt="CRP India Logo"
            style={{
              height: '44px',
              width: 'auto',
              maxHeight: '44px',
              objectFit: 'contain',
              borderRadius: '4px',
              display: 'block'
            }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              CRP India
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
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
              const isHome = link.path === '/home';
              const isProtected = isReport || isHome;
              const targetTo = !isAuthenticated && isProtected ? '/login' : link.path;
              const targetState = !isAuthenticated && isProtected ? {
                from: link.path,
                message: isHome
                  ? 'Please log in or register to access the Citizen Portal.'
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

            {/* Authority Dashboard indicator/button */}
            <Link
              to="/authority/dashboard"
              className="btn btn-secondary btn-sm"
              style={{
                borderColor: 'var(--color-primary)',
                color: 'var(--text-primary)',
                fontWeight: 500,
                gap: '6px'
              }}
            >
              <Building2 size={15} style={{ color: 'var(--color-primary)' }} />
              <span>Authority Dashboard</span>
            </Link>

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

            {/* Citizen Login / User Info */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {user?.name?.split(' ')[0]}
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

        {/* Mobile menu and theme button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mobile-controls">
          <ThemeToggle />
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{ padding: '6px 10px' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

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
                <Link
                  to="/authority/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', borderColor: 'var(--color-primary)' }}
                >
                  <Building2 size={16} style={{ color: 'var(--color-primary)' }} />
                  <span>Authority Dashboard</span>
                </Link>

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
                const isHome = link.path === '/home';
                const isProtected = isReport || isHome;
                const targetTo = !isAuthenticated && isProtected ? '/login' : link.path;
                const targetState = !isAuthenticated && isProtected ? {
                  from: link.path,
                  message: isHome
                    ? 'Please log in or register to access the Citizen Portal.'
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
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-controls { display: none !important; }
          .mobile-drawer { display: none !important; }
        }
      `}</style>
    </header>
  );
}