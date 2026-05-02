import apiClient from './apiClient';

export const applicationsService = {
  // --- CHARITY APPLYING TO DONOR OFFERS ---
  applyToOffer: async (offerId) => {
    const response = await apiClient.post(`/api/v1/charity/offers/${offerId}/apply`);
    return response.data;
  },

  getSentOfferApplications: async (params) => {
    // params: Page, PageSize
    const response = await apiClient.get('/api/v1/charity/applications/sent', { params });
    return response.data;
  },

  cancelOfferApplication: async (offerApplicationId) => {
    const response = await apiClient.delete(`/api/v1/charity/applications/${offerApplicationId}`);
    return response.data;
  },

  // --- CHARITY RECEIVING DONOR APPLICATIONS (TO NEEDS) ---
  getReceivedNeedApplications: async (params) => {
    const response = await apiClient.get('/api/v1/charity/applications/received', { params });
    return response.data;
  },

  acceptNeedApplication: async (needApplicationId) => {
    const response = await apiClient.post(`/api/v1/charity/applications/${needApplicationId}/accept`);
    return response.data;
  },

  rejectNeedApplication: async (needApplicationId) => {
    const response = await apiClient.post(`/api/v1/charity/applications/${needApplicationId}/reject`);
    return response.data;
  },

  // --- DONOR APPLYING TO CHARITY NEEDS ---
  applyToNeed: async (charityNeedId) => {
    const response = await apiClient.post(`/api/v1/donor-organization/charity-needs/${charityNeedId}/apply`);
    return response.data;
  },

  // --- DONOR RECEIVING CHARITY APPLICATIONS (TO OFFERS) ---
  getReceivedOfferApplications: async (params) => {
    const response = await apiClient.get('/api/v1/donor-organization/offer-applications/received', { params });
    return response.data;
  },

  acceptOfferApplication: async (offerApplicationId) => {
    const response = await apiClient.patch(`/api/v1/donor-organization/offer-applications/${offerApplicationId}/accept`);
    return response.data;
  },

  rejectOfferApplication: async (offerApplicationId) => {
    const response = await apiClient.patch(`/api/v1/donor-organization/offer-applications/${offerApplicationId}/reject`);
    return response.data;
  },

  // --- DONOR SENT APPLICATIONS ---
  getSentNeedApplications: async (params) => {
    // params: Page, PageSize
    const response = await apiClient.get('/api/v1/donor-organization/need-applications/sent', { params });
    return response.data;
  }
};

export default applicationsService;
