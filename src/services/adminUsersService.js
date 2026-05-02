import apiClient from './apiClient';

export const adminUsersService = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/api/v1/admin/dashboard');
    return response.data;
  },

  getPendingVerifications: async () => {
    const response = await apiClient.get('/api/v1/admin/verifications/pending');
    return response.data;
  },

  verifyUser: async (userId) => {
    const response = await apiClient.post('/api/v1/admin/verifications/verify', { userId });
    return response.data;
  },

  rejectUser: async (userId) => {
    const response = await apiClient.post('/api/v1/admin/verifications/reject', { userId });
    return response.data;
  },

  getUsers: async (params) => {
    // params: Role, IsActive, Page, PageSize
    const response = await apiClient.get('/api/v1/admin/users', { params });
    return response.data;
  },

  deactivateUser: async (userId) => {
    const response = await apiClient.post('/api/v1/admin/users/deactivate', { userId });
    return response.data;
  },

  activateUser: async (userId) => {
    const response = await apiClient.post('/api/v1/admin/users/activate', { userId });
    return response.data;
  }
};

export default adminUsersService;
