import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login/json', { email, password });
    const { access_token, user } = response.data;
    localStorage.setItem('insightforge_token', access_token);
    if (user) {
      localStorage.setItem('insightforge_user', JSON.stringify(user));
    }
    return response.data;
  },

  demoLogin: async () => {
    const response = await api.post('/auth/demo-login');
    const { access_token, user } = response.data;
    localStorage.setItem('insightforge_token', access_token);
    if (user) {
      localStorage.setItem('insightforge_user', JSON.stringify(user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    localStorage.setItem('insightforge_user', JSON.stringify(response.data));
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('insightforge_token');
    localStorage.removeItem('insightforge_user');
  },

  getStoredToken: () => {
    return localStorage.getItem('insightforge_token');
  },

  getStoredUser: () => {
    const userStr = localStorage.getItem('insightforge_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
};
