import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, isAuthenticated, isAuthority, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Verifying credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAuthority) {
    return <Navigate to="/authority/login" state={{ from: location }} replace />;
  }

  return children;
}