import apiClient from './apiClient';

export const verificationService = {
  submitCharityVerification: async (formData) => {
    // formData: RegistrationNumber, RegistrationDate, HeadquartersAddress, 
    // AuthorizedPersonName, AuthorizedPersonPosition, and PDF files
    const response = await apiClient.put('/api/v1/charity/verification-data', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  submitDonorVerification: async (formData) => {
    // formData: CommercialRegistrationNumber, CommercialRegistrationDate, 
    // TaxNumber, BusinessLicenseNumber, HeadquartersAddress, and PDF files
    const response = await apiClient.put('/api/v1/donor-organization/verification-data', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default verificationService;
