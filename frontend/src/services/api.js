import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Customer API
export const customerAPI = {
  getAll: (params) => api.get('/api/customers', { params }),
  getById: (id) => api.get(`/api/customers/${id}`),
  create: (data) => api.post('/api/customers', data),
  update: (id, data) => api.put(`/api/customers/${id}`, data),
  delete: (id) => api.delete(`/api/customers/${id}`),
  bulkImport: (customers) => api.post('/api/customers/bulk-import', { customers }),
  getStatistics: () => api.get('/api/customers/statistics'),
};

// Clustering API
export const clusteringAPI = {
  runClustering: (algorithm, params) =>
    api.post('/api/clustering/run', { algorithm, params }),
  getElbowData: (k_min, k_max) =>
    api.get('/api/clustering/elbow', { params: { k_min, k_max } }),
  getLatestResults: (algorithm) =>
    api.get('/api/clustering/results/latest', { params: { algorithm } }),
  getHistory: (page, limit) =>
    api.get('/api/clustering/results/history', { params: { page, limit } }),
  getVisualizations: (resultId) =>
    api.get(`/api/clustering/results/${resultId}/visualizations`),
  predictCluster: (customer, algorithm) =>
    api.post('/api/clustering/predict', { customer, algorithm }),
  getProfiles: () => api.get('/api/clustering/profiles'),
  loadSampleData: (clearExisting = false) =>
    api.post('/api/clustering/sample-data', null, { params: { clearExisting } }),
};

export default api;
