const API_BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_API_URL;
  // If an explicit remote URL is configured in environment, use it
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  // In production builds (like on Render), default to the live deployed backend
  if (import.meta.env.PROD) {
    return 'https://crp-india-new.onrender.com/api';
  }
  // In local development, default to local backend
  return envUrl || 'http://localhost:5000/api';
})();

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('crp_token');
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Server returned an unexpected response format.');
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
};

export const api = {
  // Auth API
  login: async (credentials) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  register: async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  // Complaints API
  submitComplaint: async (formData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: getHeaders(true),
        body: formData
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  trackComplaint: async (referenceId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(referenceId)}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  getComplaints: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/complaints${query ? `?${query}` : ''}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  updateComplaintStatus: async (id, payload) => {
    const isFormData = payload instanceof FormData;
    const res = await fetch(`${API_BASE_URL}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(isFormData),
      body: isFormData ? payload : JSON.stringify(payload)
    });
    return await handleResponse(res);
  },

  assignComplaint: async (id, payload) => {
    const res = await fetch(`${API_BASE_URL}/complaints/${id}/assign`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return await handleResponse(res);
  },

  deleteComplaint: async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  // Voting API
  voteComplaint: async (id, voteType) => {
    const res = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(id)}/vote`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ voteType })
    });
    return await handleResponse(res);
  },

  // Administrative Flagging APIs (Authority only)
  flagMisinformation: async (id, explanation) => {
    const res = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(id)}/flag-misinformation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ explanation })
    });
    return await handleResponse(res);
  },

  flagDuplicate: async (id, explanation) => {
    const res = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(id)}/flag-duplicate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ explanation })
    });
    return await handleResponse(res);
  },

  removeFlag: async (id, explanation) => {
    const res = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(id)}/remove-flag`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ explanation })
    });
    return await handleResponse(res);
  },

  // Authority API
  getAuthorityDashboard: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/authority/dashboard`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  getDeletedComplaints: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/authority/deleted-complaints${query ? `?${query}` : ''}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  // Citizen Dashboard API (Read-only)
  getCitizenDashboard: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/complaints/dashboard-stats`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  // Citizen Account & Profile APIs
  updateProfile: async (data) => {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  uploadProfilePicture: async (formData) => {
    const res = await fetch(`${API_BASE_URL}/auth/profile-picture`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: formData
    });
    return await handleResponse(res);
  },

  removeProfilePicture: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/profile-picture`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  verifyPasswordForVoterId: async (password) => {
    const res = await fetch(`${API_BASE_URL}/auth/verify-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ password })
    });
    return await handleResponse(res);
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    });
    return await handleResponse(res);
  },

  updateSettings: async (settings) => {
    const res = await fetch(`${API_BASE_URL}/auth/settings`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
    return await handleResponse(res);
  },

  // Citizen My Complaints API
  getMyComplaints: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/complaints/my${query ? `?${query}` : ''}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  // Citizen Notifications API
  getNotifications: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/notifications${query ? `?${query}` : ''}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  getUnreadNotificationCount: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    } catch {
      return { success: false, count: 0 };
    }
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  markAllNotificationsRead: async () => {
    const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  deleteNotification: async (id) => {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  // Citizen Directory & Public Profile APIs
  searchCitizens: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/citizens/search${query ? `?${query}` : ''}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  getCitizenPublicProfile: async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/citizens/${encodeURIComponent(id)}/public-profile`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  }
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};