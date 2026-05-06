import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const API_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || 15000);

const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return Promise.reject(error);
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }

    return Promise.reject(new Error('Unable to reach API. Check backend URL and network.'));
  }
);

// Auth endpoints
export const authAPI = {
  register: (username, password) =>
    api.post('/auth/register', { username, password }),
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
};

// Prediction endpoints
export const predictionAPI = {
  predict: (features, username = null) =>
    api.post('/predict', { features, username }),
  getModelInfo: () =>
    api.get('/model/info'),
};

// Health check
export const healthAPI = {
  check: () =>
    api.get('/health'),
};

export default api;
