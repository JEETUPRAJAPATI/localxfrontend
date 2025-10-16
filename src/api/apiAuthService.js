// src/api/apiAuthService.js

import apiClient from '@/utils/axios';

// User Panel
export const getUserDashboardSEOAPI = async () => {
  const response = await apiClient.get('/api/v1/auth/user/dashboard/seo');
  return response?.data?.data;
};

export const getUserDashboardAPI = async () => {
  const response = await apiClient.get('/api/v1/auth/user/dashboard');
  return response?.data?.data;
};

// User Profile

export const getUserProfileSEOAPI = async () => {
  const response = await apiClient.get('/api/v1/auth/user/profile/seo');
  return response?.data?.data;
};

export const getUserProfileAPI = async () => {
  const response = await apiClient.get(
    `/api/v1/auth/user/profile?timestamp=${new Date().getTime()}`,
  );
  return response?.data?.data;
};

export const getUserChangeProfileSEOAPI = async () => {
  const response = await apiClient.get('/api/v1/auth/user/changeProfile/seo');
  return response?.data?.data;
};

export const updateUserProfileAPI = async (formData) => {
  const response = await apiClient.post('/api/v1/auth/user/changeProfile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response?.data;
};

// User Delete Account
export const getUserDeleteAccountSEOAPI = async () => {
  const response = await apiClient.get('/api/v1/auth/user/delete-account/seo');
  return response?.data?.data;
};

export const deleteUserAccountAPI = async (formData) => {
  const response = await apiClient.post('/api/v1/auth/user/delete-account', formData);
  return response?.data;
};

export const updateNewPasswordAPI = async (formData) => {
  const response = await apiClient.post('/api/v1/auth/user/changeProfile/updatePassword', formData);
  return response?.data;
};

export const updateUsernameAPI = async (formData) => {
  const response = await apiClient.post('/api/v1/auth/user/setUsername', formData);
  return response?.data;
};

export const verifyEmailUpdateVerificationCodeAPI = async (formData) => {
  const response = await apiClient.post(
    '/api/v1/auth/user/changeProfile/verifyEmailUpdateVerificationCode',
    formData,
  );
  return response?.data;
};

export const getUserAllPostSEOAPI = async () => {
  const response = await apiClient.get('/api/v1/auth/user/post/all/seo');
  return response?.data?.data;
};

export const getUserAllPostAPI = async (params) => {
  const response = await apiClient.get('/api/v1/auth/user/post/all', {
    params,
  });
  return response?.data?.data;
};

export const getUserPostDetailSEOAPI = async (postId) => {
  const response = await apiClient.get(`/api/v1/auth/user/post/view/${postId}/seo`);
  return response?.data?.data;
};

export const getUserPostDetailAPI = async (postId) => {
  const response = await apiClient.get(`/api/v1/auth/user/post/view/${postId}`);
  return response?.data?.data;
};

export const getUserAddPostSEOAPI = async () => {
  const response = await apiClient.get(`/api/v1/auth/user/post/add/seo`);
  return response?.data?.data;
};

export const getUserAddPostFetchCountriesAPI = async () => {
  const response = await apiClient.get(`/api/v1/auth/user/post/add/fetchCountries`);
  return response?.data?.data;
};

export const getUserAddPostFetchCitiesAPI = async (countryId) => {
  const response = await apiClient.get(`/api/v1/auth/user/post/add/fetchCities/${countryId}`);
  return response?.data?.data;
};

export const getUserAddPostFetchSubCitiesAPI = async (countryId, cityId) => {
  const response = await apiClient.get(
    `/api/v1/auth/user/post/add/fetchSubCities/${countryId}/${cityId}`,
  );
  return response?.data?.data;
};

export const getUserAddPostFetchCategoriesAPI = async () => {
  const response = await apiClient.get(`/api/v1/auth/user/post/add/fetchCategories`);
  return response?.data?.data;
};

export const getUserAddPostFetchSubCategoriesAPI = async (categoryId) => {
  const response = await apiClient.get(
    `/api/v1/auth/user/post/add/fetchSubCategories/${categoryId}`,
  );
  return response?.data?.data;
};

export const getUserAddPostFetchOtherDataAPI = async () => {
  const response = await apiClient.get(`/api/v1/auth/user/post/add/getOtherData`);
  return response?.data?.data;
};

export const addUserPostSaveAPI = async (formData) => {
  const response = await apiClient.post('/api/v1/auth/user/post/save', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response?.data;
};

export const getUserPostEditSEOAPI = async (postId) => {
  const response = await apiClient.get(`/api/v1/auth/user/post/edit/${postId}/seo`);
  return response?.data?.data;
};

export const getUserPostEditAPI = async (postId) => {
  const response = await apiClient.get(`/api/v1/auth/user/post/edit/${postId}`);
  return response?.data?.data;
};

export const updateUserPostEditAPI = async (form) => {
  const response = await apiClient.post('/api/v1/auth/user/post/update', form);
  return response?.data;
};

export const deleteUserPostAPI = async (form) => {
  const response = await apiClient.post('/api/v1/auth/user/post/delete', form);
  return response?.data;
};

export const getUserRechargeBalanceSEOAPI = async () => {
  const response = await apiClient.get('/api/v1/auth/user/balance/recharge/seo');
  return response?.data?.data;
};

export const getUserRechargeBalanceAPI = async () => {
  const response = await apiClient.get('/api/v1/auth/user/balance/recharge');
  return response?.data?.data;
};

export const getUserManualPaymentDetailAPI = async ({ manualPaymentMethodId, authToken }) => {
  try {
    const response = await apiClient.get('/api/v1/auth/user/balance/manualPaymentDetail', {
      params: { manualPaymentMethodId },
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response?.data?.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const userSaveManualRechargeBalanceAPI = async (formData) => {
  const response = await apiClient.post('/api/v1/auth/user/balance/saveManualRechargeBalance', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response?.data;
};

export const getUserAllBalanceSEOAPI = async () => {
  const response = await apiClient.get('/api/v1/auth/user/balance/histories/seo');
  return response?.data?.data;
};

export const getUserRechargeHistoriesAPI = async (params) => {
  const response = await apiClient.get('/api/v1/auth/user/balance/histories', {
    params,
  });
  return response?.data?.data;
};

export const getUserAllInvoiceAPI = async (params) => {
  const response = await apiClient.get('/api/v1/auth/user/invoice/histories', {
    params,
  });
  return response?.data?.data;
};

export const getUserNotificationsAPI = async (params) => {
  const response = await apiClient.get('/api/v1/auth/user/notifications', {
    params,
  });
  return response?.data?.data;
};

export const readUserNotificationsAPI = async (form) => {
  const response = await apiClient.post('/api/v1/auth/user/read/notification', form);
  return response?.data;
};
