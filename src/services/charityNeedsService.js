import apiClient from './apiClient';

export const charityNeedsService = {
  // --- PUBLIC ENDPOINTS ---
  getPublicCharityNeeds: async (params) => {
    // params: Category, City, Governorate, Search, Page, PageSize
    const response = await apiClient.get('/api/v1/public/charity-needs', { params });
    return response.data;
  },
  
  getPublicCharityNeedById: async (id) => {
    const response = await apiClient.get(`/api/v1/public/charity-needs/${id}`);
    return response.data;
  },

  // --- CHARITY ENDPOINTS ---
  createCharityNeed: async (formData) => {
    // formData should contain: Category, ProductName, Quantity, Priority, Description, ProductImage (file)
    const response = await apiClient.post('/api/v1/charity/charity-needs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getMyCharityNeeds: async (params) => {
    // params: Status, Page, PageSize
    const response = await apiClient.get('/api/v1/charity/charity-needs', { params });
    return response.data;
  },

  getMyCharityNeedById: async (id) => {
    const response = await apiClient.get(`/api/v1/charity/charity-needs/${id}`);
    return response.data;
  },

  updateCharityNeed: async (id, formData) => {
    const response = await apiClient.put(`/api/v1/charity/charity-needs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteCharityNeed: async (id) => {
    const response = await apiClient.delete(`/api/v1/charity/charity-needs/${id}`);
    return response.data;
  },

  fulfillCharityNeed: async (id) => {
    const response = await apiClient.post(`/api/v1/charity/charity-needs/${id}/fulfill`);
    return response.data;
  },

  // --- ADMIN ENDPOINTS ---
  getPendingCharityNeeds: async (params) => {
    // params: Page, PageSize
    const response = await apiClient.get('/api/v1/admin/charity-needs/pending', { params });
    return response.data;
  },

  approveCharityNeed: async (charityNeedId) => {
    const response = await apiClient.post('/api/v1/admin/charity-needs/approve', { charityNeedId });
    return response.data;
  },

  rejectCharityNeed: async (charityNeedId) => {
    const response = await apiClient.post('/api/v1/admin/charity-needs/reject', { charityNeedId });
    return response.data;
  }
};

export default charityNeedsService;
