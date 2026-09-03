import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('crp_token') || null);
  const [portalRole, setPortalRole] = useState(() => localStorage.getItem('crp_portal_role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('crp_token');
      if (savedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, expectedRole, voterId) => {
    const payload = { email, password, expectedRole };
    if (voterId) payload.voterId = voterId;
    const res = await api.login(payload);
    if (res.success && res.token) {
      localStorage.setItem('crp_token', res.token);
      setToken(res.token);
      setUser(res.user);
      const activeRole = res.user.role === 'authority' ? 'authority' : 'citizen';
      localStorage.setItem('crp_portal_role', activeRole);
      setPortalRole(activeRole);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('crp_token', res.token);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('crp_portal_role', 'citizen');
      setPortalRole('citizen');
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('crp_token');
    setToken(null);
    setUser(null);
  };

  const selectPortal = (role) => {
    localStorage.setItem('crp_portal_role', role);
    setPortalRole(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        portalRole,
        isAuthenticated: !!token && !!user,
        isAuthority: user?.role === 'authority',
        loading,
        login,
        register,
        logout,
        selectPortal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);