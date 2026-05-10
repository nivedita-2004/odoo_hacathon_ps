import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  isInitializing: true,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(credentials);
      const { access_token, refresh_token, user } = response.data.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(userData);
      const { access_token, refresh_token, user } = response.data.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false, error: null });
  },

  initAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isAuthenticated: false, isInitializing: false });
      return;
    }
    
    try {
      const response = await authAPI.getMe();
      set({ 
        user: response.data.data.user, 
        isAuthenticated: true, 
        isInitializing: false 
      });
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ 
        user: null, 
        isAuthenticated: false, 
        isInitializing: false 
      });
    }
  },

  fetchUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isAuthenticated: false, isInitializing: false });
      return;
    }
    
    try {
      const response = await authAPI.getMe();
      set({ user: response.data.data.user, isAuthenticated: true, isInitializing: false });
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isInitializing: false });
    }
  },

  clearError: () => set({ error: null }),
}));
