import apiClient from './apiClient';

export const dashboardService = {
  // --- ADMIN DASHBOARD ---
  // (Note: also exists in adminUsersService, kept here for unified dashboard imports if needed)
  getAdminDashboard: async () => {
    const response = await apiClient.get('/api/v1/admin/dashboard');
    return response.data;
  },

  // --- CHARITY DASHBOARD ---
  getCharityDashboard: async () => {
    const response = await apiClient.get('/api/v1/charity/dashboard');
    return response.data;
  },

  // --- DONOR DASHBOARD ---
  getDonorDashboard: async () => {
    const response = await apiClient.get('/api/v1/donor-organization/dashboard');
    return response.data;
  },

  // --- PUBLIC STATISTICS ---
  getPublicStatistics: async () => {
    const response = await apiClient.get('/api/v1/public/statistics');
    return response.data;
  }
};

export default dashboardService;
