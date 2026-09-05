import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CitizenProtectedRoute({ children }) {
  const { isAuthenticated, isAuthority, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Verifying credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const isTrack = location.pathname.startsWith('/track') || location.pathname.startsWith('/complaint');
    const isDashboard = location.pathname.startsWith('/dashboard');
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: isDashboard
            ? 'Please log in or register to view the citizen grievance dashboard.'
            : isTrack
            ? 'Please log in or register to track your complaints.'
            : 'Please log in or register to report a civic issue.'
        }}
        replace
      />
    );
  }

  if (isAuthority) {
    return <Navigate to="/authority/dashboard" replace />;
  }

  return children;
}