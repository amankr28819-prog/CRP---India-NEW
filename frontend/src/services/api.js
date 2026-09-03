const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const res = await fetch(`${API_BASE_URL}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
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