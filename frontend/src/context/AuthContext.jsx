import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('crp_token') || null);
  const [portalRole, setPortalRole] = useState(() => localStorage.getItem('crp_portal_role') || null);
  const [loading, setLoading] = useState(true);

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const fetchUnreadNotifications = async () => {
    if (!localStorage.getItem('crp_token')) return;
    try {
      const res = await api.getUnreadNotificationCount();
      if (res && res.success) {
        setUnreadNotificationsCount(res.count || 0);
      }
    } catch {
      // ignore
    }
  };

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('crp_token');
    if (savedToken) {
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          fetchUnreadNotifications();
          return res.user;
        }
      } catch {
        // ignore
      }
    }
    return null;
  };

  const updateUser = (dataOrFn) => {
    setUser(prev => (typeof dataOrFn === 'function' ? dataOrFn(prev) : { ...prev, ...dataOrFn }));
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('crp_token');
      if (savedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            fetchUnreadNotifications();
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

  // Periodic check for notifications when logged in as citizen
  useEffect(() => {
    if (!token || !user || user.role !== 'citizen') return;
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, user?.role]);

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
      fetchUnreadNotifications();
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
      fetchUnreadNotifications();
    }
    return res;
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPortalSwitchModal, setShowPortalSwitchModal] = useState(false);

  const logout = () => {
    localStorage.removeItem('crp_token');
    localStorage.removeItem('crp_portal_role');
    setToken(null);
    setUser(null);
    setPortalRole('citizen');
    setUnreadNotificationsCount(0);
  };

  const requestLogout = () => {
    setShowLogoutModal(true);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  const requestPortalSwitch = () => {
    setShowPortalSwitchModal(true);
  };

  const cancelPortalSwitch = () => {
    setShowPortalSwitchModal(false);
  };

  const confirmPortalSwitch = () => {
    logout();
    setShowPortalSwitchModal(false);
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
        showLogoutModal,
        requestLogout,
        cancelLogout,
        confirmLogout,
        showPortalSwitchModal,
        requestPortalSwitch,
        cancelPortalSwitch,
        confirmPortalSwitch,
        selectPortal,
        updateUser,
        refreshUser,
        unreadNotificationsCount,
        setUnreadNotificationsCount,
        fetchUnreadNotifications
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);