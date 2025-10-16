// src/api/apiService.js

import apiClient from '@/utils/axios';

// Home Page
export const getHomeSEOAPI = async () => {
  const response = await apiClient.get('/api/v1/home/seo');
  return response?.data?.data;
};

export const getHomeTopNoticeAPI = async () => {
  const response = await apiClient.get('/api/v1/home/topNotice', { headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" } });
  return response?.data?.data;
};

export const getHomeDashboardContentAPI = async () => {
  const response = await apiClient.get('/api/v1/home/dashboardContent', { headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" } });
  return response?.data?.data;
};

export const getHomeCountriesAPI = async () => {
  const response = await apiClient.get('/api/v1/home/countries');
  return response?.data?.data;
};

export const getHomeCountriesV2API = async (params = {}) => {
  const response = await apiClient.get('/api/v1/home/countriesV2', { params, headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" } });
  return response?.data?.data;
};

export const getHomeLoadMoreCountriesAPI = async (params = {}) => {
  const response = await apiClient.get('/api/v1/home/loadMoreCountries', { params, headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" } });
  return response?.data?.data;
}

export const getHomeLoadMoreCitiesAPI = async (params = {}) => {
  const response = await apiClient.get('/api/v1/home/loadMoreCities', { params });
  return response?.data?.data;
};

export const getHomeLoadMoreSubcitiesAPI = async (params = {}) => {
  const response = await apiClient.get('/api/v1/home/loadMoreSubcities', { params, headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" } });
  return response?.data?.data;
};

export const getHomePartnersAPI = async () => {
  const response = await apiClient.get('/api/v1/home/partners', { headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" } });
  return response?.data?.data;
};

export const getHomeSponsersAPI = async (params = {}) => {
  const response = await apiClient.get('/api/v1/home/sponsers', { params, headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" } });
  return response?.data?.data;
};

// Category List Page
export const getCategorySEOAPI = async (country, city, subCity) => {
  const response = await apiClient.get(`/api/v1/categories/seo/${country}/${city}/${subCity}`);
  return response?.data?.data;
};

export const getCategoriesSubCategoriesAPI = async (country, city, subCity) => {
  const response = await apiClient.get(`/api/v1/categories/all/${country}/${city}/${subCity}`);
  return response?.data?.data;
};

export const getCategoriesPostAdsAPI = async () => {
  const response = await apiClient.get(`/api/v1/categories/postAds`);
  return response?.data?.data;
};

export const getCategoryAgeVerificationModalContentAPI = async () => {
  const response = await apiClient.get(`/api/v1/categories/ageVerificationModalContent`);
  return response?.data?.data;
};

export const getCategoryTopSideNavLinksAPI = async () => {
  const response = await apiClient.get(`/api/v1/categories/topSideNavLinks`);
  return response?.data?.data;
};

export const getCategorySponsersAPI = async (params = {}) => {
  const response = await apiClient.get(`/api/v1/categories/sponsers`, {
    params,
  });
  return response?.data?.data;
};

// Post List Page
export const getPostSEOAPI = async (params) => {
  const response = await apiClient.get(`/api/v1/posts/seo`, { params });
  return response?.data?.data;
};

export const getPostAlertMessageAPI = async () => {
  const response = await apiClient.get(`/api/v1/posts/alertMsg`);
  return response?.data?.data;
};

export const getPostsAPI = async (params) => {
  const response = await apiClient.get(`/api/v1/posts/all`, { params });
  return response?.data?.data;
};

export const getPostLeftSideFiltersAPI = async (params) => {
  const response = await apiClient.get(`/api/v1/posts/leftSideFilters`, {
    params,
  });
  return response?.data?.data;
};

export const getPostTypeAdsAPI = async () => {
  const response = await apiClient.get(`/api/v1/posts/ads`);
  return response?.data?.data;
};

export const getPostLeftAdsAPI = async () => {
  const response = await apiClient.get(`/api/v1/posts/leftAds`);
  return response?.data?.data;
};

export const getPostRightAdsAPI = async () => {
  const response = await apiClient.get(`/api/v1/posts/rightAds`);
  return response?.data?.data;
};

export const getPostSubCategoryContentAPI = async (params) => {
  const response = await apiClient.get(`/api/v1/posts/subCategoryContent`, {
    params,
  });
  return response?.data?.data;
};

export const getPostSubCategoriesAPI = async (params) => {
  const response = await apiClient.get(`/api/v1/posts/subCategoriesByCategory`, {
    params,
  });
  return response?.data?.data;
};

// Post Detail Page
export const getPostDetailSEOAPI = async (
  country,
  city,
  subCity,
  category,
  subCategory,
  postId,
) => {
  const response = await apiClient.get(
    `/api/v1/post/seo/${country}/${city}/${subCity}/${category}/${subCategory}/${postId}`,
  );
  return response?.data?.data;
};

export const getPostDetailAPI = async (country, city, subCity, category, subCategory, postId) => {
  const response = await apiClient.get(
    `/api/v1/post/get/${country}/${city}/${subCity}/${category}/${subCategory}/${postId}`,
  );
  return response?.data?.data;
};

export const getAdsAPI = async () => {
  const response = await apiClient.get(`/api/v1/post/ads`);
  return response?.data?.data;
};

export const addPostReportAPI = async (reportData) => {
  const response = await apiClient.post('/api/v1/post/report', reportData); // Pass reportData as body
  return response?.data;
};

export const updatePostAdsClickCountAPI = async (postId) => {
  const response = await apiClient.get(`/api/v1/posts/updatePostAdsClickCount/${postId}`);
  return response?.data?.data;
};

// Authentication Pages
export const authSignUpAPI = async (form) => {
  const response = await apiClient.post('/api/v1/auth/signup', form);
  return response?.data;
};

export const getAuthSignUpSEOAPI = async () => {
  const response = await apiClient.get(`/api/v1/auth/signup/seo`);
  return response?.data?.data;
};

export const authLoginAPI = async (form) => {
  const response = await apiClient.post('/api/v1/auth/login', form);
  return response?.data;
};

export const getAuthLoginSEOAPI = async () => {
  const response = await apiClient.get(`/api/v1/auth/login/seo`);
  return response?.data?.data;
};

export const getAuthLoginAlertMessageAPI = async () => {
  const response = await apiClient.get(`/api/v1/auth/login/alertMsg`);
  return response?.data?.data;
};

export const authGoogleLoginAPI = async (form) => {
  const response = await apiClient.post('/api/v1/auth/login/googleAuth', form);
  return response?.data;
};

export const authSignUpSendVerificationCode = async (form) => {
  const response = await apiClient.post('/api/v1/auth/signup/sendVerificationCode', form);
  return response?.data;
};

export const authSignUpVerifyVerificationCode = async (form) => {
  const response = await apiClient.post('/api/v1/auth/signup/verifyVerificationCode', form);
  return response?.data;
};

export const getAuthSignUpVerificationSEOAPI = async () => {
  const response = await apiClient.get(`/api/v1/auth/signupVerification/seo`);
  return response?.data?.data;
};

export const getAuthForgotVerificationSEOAPI = async () => {
  const response = await apiClient.get(`/api/v1/auth/forgotVerification/seo`);
  return response?.data?.data;
};

export const authForgotVerificationSendVerificationCodeAPI = async (form) => {
  const response = await apiClient.post(
    '/api/v1/auth/forgotVerification/sendVerificationCode',
    form,
  );
  return response?.data;
};

export const getAuthForgotPasswordSEOAPI = async () => {
  const response = await apiClient.get(`/api/v1/auth/forgotPassword/seo`);
  return response?.data?.data;
};

export const authForgotPasswordSendVerificationCodeAPI = async (form) => {
  const response = await apiClient.post(
    '/api/v1/auth/forgotPassword/sendResetPasswordVerificationCode',
    form,
  );
  return response?.data;
};

export const getAuthResetPasswordSEOAPI = async () => {
  const response = await apiClient.get(`/api/v1/auth/resetPassword/seo`);
  return response?.data?.data;
};

export const authResetPasswordWithVerificationAPI = async (form) => {
  const response = await apiClient.post(
    '/api/v1/auth/resetPassword/resetPasswordWithVerification',
    form,
  );
  return response?.data;
};

// Common Pages
export const getPageContactSEOAPI = async () => {
  const response = await apiClient.get(`/api/v1/page/contact/seo`);
  return response?.data?.data;
};

export const pageContactAPI = async (form) => {
  const response = await apiClient.post('/api/v1/page/contact', form);
  return response?.data;
};

export const getPageAboutSEOAPI = async () => {
  const response = await apiClient.get(`/api/v1/page/about/seo`);
  return response?.data?.data;
};

export const getPageAboutAPI = async () => {
  const response = await apiClient.get(`/api/v1/page/about`);
  return response?.data?.data;
};

export const getPageTermsSEOAPI = async () => {
  const response = await apiClient.get(`/api/v1/page/terms/seo`);
  return response?.data?.data;
};

export const getPageTermsAPI = async () => {
  const response = await apiClient.get(`/api/v1/page/terms`);
  return response?.data?.data;
};

// Partners Page
export const getPartnersSEOAPI = async () => {
  const response = await apiClient.get('/api/v1/partners/seo');
  return response?.data?.data;
};

export const getPartnersAPI = async () => {
  const response = await apiClient.get('/api/v1/partners', {
    headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" },
  });
  return response?.data?.data;
};

export const getPartnersContentAPI = async () => {
  const response = await apiClient.get('/api/v1/partners/content', {
    headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" },
  });
  return response?.data?.data;
};

export const getPartnersAddSEOAPI = async () => {
  const response = await apiClient.get('/api/v1/partners/add/seo');
  return response?.data?.data;
};

export const partnersAddAPI = async (form) => {
  const response = await apiClient.post('/api/v1/partners/add', form);
  return response?.data;
};

// Partners By Category
export const getPartnersByCategorySEOAPI = async (category) => {
  const response = await apiClient.get(`/api/v1/partners/${category}/seo`);
  return response?.data?.data;
};


export const getPartnersByCategoryAPI = async (category) => {
  const response = await apiClient.get(`/api/v1/partners/${category}`, {
    headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" },
  });
  return response?.data?.data;
};

export const getDetailPartnerByCategorySEOAPI = async (category, title) => {
  const response = await apiClient.get(`/api/v1/partners/${category}/detail/${title}/seo`);
  return response?.data?.data;
};

export const getDetailPartnerByCategoryAPI = async (category, title) => {
  const response = await apiClient.get(`/api/v1/partners/${category}/detail/${title}`);
  return response?.data?.data;
};

export const getSearchPartnersSEOAPI = async (params) => {
  const response = await apiClient.get(`/api/v1/partners/list/search/seo`, {
    params,
  });
  return response?.data?.data;
};

export const getSearchPartnersAPI = async (params) => {
  const response = await apiClient.get(`/api/v1/partners/list/search`, {
    params,
  });
  return response?.data?.data;
};

// Friends Page
export const getFriendsSEOAPI = async () => {
  const response = await apiClient.get('/api/v1/friends/seo');
  return response?.data?.data;
};

export const getFriendsAPI = async () => {
  const response = await apiClient.get('/api/v1/friends');
  return response?.data?.data;
};

export const getFriendsAdsAPI = async () => {
  const response = await apiClient.get('/api/v1/friends/ads');
  return response?.data?.data;
};

export const getPageCommonSettingsAPI = async () => {
  const response = await apiClient.get(`/api/v1/page/settings`, { headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" } });
  return response?.data?.data;
};

// Blogs Page
export const getBlogsSEOAPI = async (params = {}) => {
  const response = await apiClient.get('/api/v1/blogs/seo', { params });
  return response?.data?.data;
};

export const getBlogsAPI = async (params) => {
  const response = await apiClient.get('/api/v1/blogs', {
    params,
    headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" },
  });
  return response?.data?.data;
};

export const getBlogCategoriesAPI = async () => {
  const response = await apiClient.get('/api/v1/blog/categories', {
    headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" },
  });
  return response?.data?.data;
};


export const getBlogDetailSEOAPI = async (slug = '') => {
  const response = await apiClient.get(`/api/v1/blog/${slug}/seo`, {
    headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" },
  });
  return response?.data?.data;
};
export const getBlogDetailAPI = async (slug = '') => {
  const response = await apiClient.get(`/api/v1/blog/${slug}`, {
    headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" },
  });
  return response?.data?.data;
};

// SiteMap
export const getCategoriesSiteMapAPI = async () => {
  const response = await apiClient.get(`/api/v1/page/categories-sitemap`);
  return response?.data?.data;
};

export const getPostSiteMapAPI = async (params) => {
  const response = await apiClient.get(`/api/v1/page/posts-sitemap`, { params });
  return response?.data?.data;
};

export const getPartnerSitesMapAPI = async () => {
  const response = await apiClient.get(`/api/v1/page/partners-sitemap`);
  return response?.data?.data;
};