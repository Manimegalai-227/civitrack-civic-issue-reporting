import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Interceptor to attach Authorization header if token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civitrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Services
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Issues Services
export const getIssues = async (params = {}) => {
  const response = await api.get('/issues', { params });
  return response.data;
};

export const getIssueById = async (id) => {
  const response = await api.get(`/issues/${id}`);
  return response.data;
};

export const createIssue = async (formData) => {
  // Support multipart/form-data for file uploads
  const response = await api.post('/issues', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getMyReports = async () => {
  const response = await api.get('/issues/my-reports');
  return response.data;
};

export const updateIssueStatus = async (id, status) => {
  const response = await api.patch(`/issues/${id}/status`, { status });
  return response.data;
};

export const deleteIssue = async (id) => {
  const response = await api.delete(`/issues/${id}`);
  return response.data;
};

export default api;
