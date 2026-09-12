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

  getGoogleConfig: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google/config`);
      return await handleResponse(res);
    } catch {
      return { success: false, clientId: '' };
    }
  },

  googleAuth: async (credential) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  googleLink: async (credential, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, password })
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
  },

  googleOnboard: async (onboardData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/google/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardData)
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please ensure the backend is running.');
      }
      throw err;
    }
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

  sendAuthorityMessage: async (id, message) => {
    const res = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(id)}/authority-messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message })
    });
    return await handleResponse(res);
  },

  getAuthorityMessages: async (id) => {
    const res = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(id)}/authority-messages`, {
      headers: getHeaders()
    });
    return await handleResponse(res);
  },

  getDepartmentOfficers: async () => {
    const res = await fetch(`${API_BASE_URL}/authority/officers`, {
      headers: getHeaders()
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
    let payload;
    if (typeof currentPassword === 'object' && currentPassword !== null) {
      payload = currentPassword;
    } else {
      payload = { currentPassword, newPassword, confirmPassword };
    }
    const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return await handleResponse(res);
  },

  verifyResetCredentials: async (email, phone, voterId) => {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phone, voterId })
    });
    return await handleResponse(res);
  },

  confirmPasswordReset: async (resetToken, newPassword, confirmPassword) => {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resetToken, newPassword, confirmPassword })
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
  },

  sendAIChatMessage: async (message, history = []) => {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message, history, stream: false })
      });
      return await handleResponse(res);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your network connection.');
      }
      throw err;
    }
  },

  streamAIChatMessage: async (message, history = [], onChunk, signal) => {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ message, history, stream: true }),
        signal
      });

      if (!res.ok) {
        let errData;
        try {
          errData = await res.json();
        } catch {
          // Ignore json parse error if response is not json
        }
        const errorMsg = errData?.message || `Request failed with status ${res.status}`;
        const err = new Error(errorMsg);
        err.status = res.status;
        err.data = errData;
        throw err;
      }

      const contentType = res.headers.get('content-type') || '';
      // Fallback if backend returned standard JSON instead of SSE
      if (!contentType.includes('text/event-stream')) {
        const data = await res.json();
        const text = data?.message || '';
        if (text && onChunk) {
          onChunk(text, text);
        }
        return text;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let batchText = '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;

          if (trimmed.startsWith('data:')) {
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                batchText += parsed.text;
                accumulatedText += parsed.text;
              }
            } catch (jsonErr) {
              if (jsonErr.message && !jsonErr.message.includes('JSON')) {
                throw jsonErr;
              }
            }
          }
        }

        if (batchText && onChunk) {
          onChunk(batchText, accumulatedText);
        }
      }

      // Process any trailing data in buffer
      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.slice(5).trim();
          if (dataStr !== '[DONE]') {
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                if (onChunk) {
                  onChunk(parsed.text, accumulatedText);
                }
              }
            } catch {}
          }
        }
      }

      return accumulatedText;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw err;
      }
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your network connection.');
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