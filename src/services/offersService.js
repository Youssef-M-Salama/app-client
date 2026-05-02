import apiClient from './apiClient';

export const offersService = {
  // --- PUBLIC ENDPOINTS ---
  getPublicOffers: async (params) => {
    // params: Category, City, Governorate, Search, Page, PageSize
    const response = await apiClient.get('/api/v1/public/offers', { params });
    return response.data;
  },
  
  getPublicOfferById: async (id) => {
    const response = await apiClient.get(`/api/v1/public/offers/${id}`);
    return response.data;
  },

  // --- DONOR ORGANIZATION ENDPOINTS ---
  createOffer: async (formData) => {
    // formData should contain: Category, ProductName, Quantity, ExpiryDate, Description, ProductImage (file)
    const response = await apiClient.post('/api/v1/donor-organization/offer', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getMyOffers: async (params) => {
    // params: Status, Page, PageSize
    const response = await apiClient.get('/api/v1/donor-organization/offer/my-offers', { params });
    return response.data;
  },

  getMyOfferById: async (id) => {
    const response = await apiClient.get(`/api/v1/donor-organization/offer/my-offers/${id}`);
    return response.data;
  },

  updateOffer: async (id, formData) => {
    const response = await apiClient.put(`/api/v1/donor-organization/offer/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteOffer: async (id) => {
    const response = await apiClient.delete(`/api/v1/donor-organization/offer/${id}`);
    return response.data;
  },

  fulfillOffer: async (id) => {
    const response = await apiClient.patch(`/api/v1/donor-organization/offer/${id}/fulfill`);
    return response.data;
  },

  // --- ADMIN ENDPOINTS ---
  getPendingOffers: async (params) => {
    // params: Page, PageSize
    const response = await apiClient.get('/api/v1/admin/offers/pending', { params });
    return response.data;
  },

  approveOffer: async (offerId) => {
    const response = await apiClient.post('/api/v1/admin/offers/approve', { offerId });
    return response.data;
  },

  rejectOffer: async (offerId) => {
    const response = await apiClient.post('/api/v1/admin/offers/reject', { offerId });
    return response.data;
  }
};

export default offersService;
