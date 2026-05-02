import apiClient from './apiClient';

export const profileService = {
  getProfile: async () => {
    const response = await apiClient.get('/api/v1/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    // profileData: { phone, whatsapp, city, governorate, postalCode }
    const response = await apiClient.put('/api/v1/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    // passwordData: { currentPassword, newPassword, confirmPassword }
    const response = await apiClient.patch('/api/v1/profile/password', passwordData);
    return response.data;
  },

  updateImage: async (formData) => {
    // formData contains 'Image' as file
    const response = await apiClient.patch('/api/v1/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default profileService;
