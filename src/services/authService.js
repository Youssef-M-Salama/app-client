import apiClient from './apiClient';

export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post('/api/v1/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await apiClient.post('/api/v1/auth/register', userData);
    return response.data;
  },
  
  verifyEmail: async (userId, token) => {
    const response = await apiClient.get('/api/v1/auth/verify-email', {
      params: { userId, token }
    });
    return response.data;
  },

  resendVerification: async (email) => {
    const response = await apiClient.post('/api/v1/auth/resend-verification', { email });
    return response.data;
  },
  
  logout: async () => {
    const response = await apiClient.post('/api/v1/auth/logout');
    return response.data;
  }
};

export default authService;
