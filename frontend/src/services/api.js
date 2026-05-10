import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // No refresh token, logout
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getDashboard: () => api.get('/users/dashboard'),
  uploadPhoto: (formData) => api.post('/users/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Trip APIs
export const tripAPI = {
  getTrips: (params) => api.get('/trips', { params }),
  getPublicTrips: (params) => api.get('/trips/public', { params }),
  getTrip: (id) => api.get(`/trips/${id}`),
  createTrip: (data) => api.post('/trips', data),
  updateTrip: (id, data) => api.put(`/trips/${id}`, data),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
  cloneTrip: (id) => api.post(`/trips/${id}/clone`),
  getItinerary: (id) => api.get(`/trips/${id}/itinerary`),
};

// Trip Stop APIs
export const tripStopAPI = {
  getStops: (tripId) => api.get(`/trips/${tripId}/stops`),
  createStop: (tripId, data) => api.post(`/trips/${tripId}/stops`, data),
  updateStop: (tripId, stopId, data) => api.put(`/trips/${tripId}/stops/${stopId}`, data),
  deleteStop: (tripId, stopId) => api.delete(`/trips/${tripId}/stops/${stopId}`),
  reorderStops: (tripId, data) => api.put(`/trips/${tripId}/stops/reorder`, data),
};

// City APIs
export const cityAPI = {
  getCities: (params) => api.get('/cities', { params }),
  searchCities: (query) => api.get('/cities/search', { params: { q: query } }),
  getPopularCities: () => api.get('/cities/popular'),
  getCity: (id) => api.get(`/cities/${id}`),
};

// Activity APIs
export const activityAPI = {
  getActivities: (params) => api.get('/activities', { params }),
  searchActivities: (query) => api.get('/activities/search', { params: { q: query } }),
  getActivity: (id) => api.get(`/activities/${id}`),
};

// Budget APIs
export const budgetAPI = {
  getBudget: (tripId) => api.get(`/trips/${tripId}/budget`),
  createOrUpdateBudget: (tripId, data) => api.post(`/trips/${tripId}/budget`, data),
};

// Packing APIs
export const packingAPI = {
  getItems: (tripId) => api.get(`/trips/${tripId}/packing`),
  createItem: (tripId, data) => api.post(`/trips/${tripId}/packing`, data),
  updateItem: (tripId, itemId, data) => api.put(`/trips/${tripId}/packing/${itemId}`, data),
  deleteItem: (tripId, itemId) => api.delete(`/trips/${tripId}/packing/${itemId}`),
  toggleItem: (tripId, itemId) => api.patch(`/trips/${tripId}/packing/${itemId}/toggle`),
};

export default api;
