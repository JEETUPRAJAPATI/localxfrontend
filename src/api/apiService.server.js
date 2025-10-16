// Server-side API service for getStaticProps
import serverApiClient from '@/utils/axios.server';

// Fallback data to prevent blocking when API endpoints are not available
const FALLBACK_DATA = {
  seo: {
    title: 'Find Escorts Near you Online - Casual Dating | Localxlist',
    description: 'Localxlist is a free platform to find female and male escorts near you. Explore casual dating and massage services online.',
    keywords: 'local escorts,escort sites,escort website',
    robots: 'index, follow',
    ogTitle: 'Find Escorts Near you Online | Localxlist',
    ogDescription: 'Localxlist is a free platform to find female and male escorts near you.',
    ogImage: '/images/logo.webp',
    ogSiteName: 'localxlist',
    ogType: 'website',
    ogUrl: 'https://localxlist.net',
    image: '/images/logo.webp',
    favicon: '/images/favicon.ico',
    author: 'Localxlist.net'
  },
  topNotice: '<p>Localxlist.org is a Free casual dating and personal classified website.</p>',
  dashboardContent: '<h1>Find here male and Female Escorts Online</h1><p>Welcome to LocalXList - your platform for connections.</p>',
  countries: {
    list: [
      {
        id: 1,
        country: 'United States',
        cities: [
          {
            id: 1,
            city: 'New York',
            subcities: [
              { id: 1, subcity: 'Manhattan' },
              { id: 2, subcity: 'Brooklyn' }
            ]
          }
        ]
      }
    ],
    hasMoreCountries: false,
    countryPagination: { totalPages: 1, currentPage: 1, nextPage: null }
  },
  partners: [],
  sponsers: { heading: 'Sponsored Websites', data: [] },
  commonSettings: {
    siteName: 'LocalXList',
    headerLogo: '/images/logo.webp',
    footerLogo: '/images/logo.webp',
    favicon: '/images/favicon.ico'
  }
};

// Home Page - Server-side versions with fallbacks
export const getHomeSEOAPI = async () => {
  try {
    const response = await serverApiClient.get('/api/v1/home/seo');
    return response?.data?.data;
  } catch (error) {
    console.warn('SEO API not available:', error.message);
    return FALLBACK_DATA.seo;
  }
};

export const getHomeTopNoticeAPI = async () => {
  try {
    const response = await serverApiClient.get('/api/v1/home/topNotice', { 
      headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" } 
    });
    return response?.data?.data;
  } catch (error) {
    console.warn('Top Notice API not available:', error.message);
    return FALLBACK_DATA.topNotice;
  }
};

export const getHomeDashboardContentAPI = async () => {
  try {
    const response = await serverApiClient.get('/api/v1/home/dashboardContent', { 
      headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" } 
    });
    return response?.data?.data;
  } catch (error) {
    console.warn('Dashboard Content API not available:', error.message);
    return FALLBACK_DATA.dashboardContent;
  }
};

export const getHomeCountriesAPI = async () => {
  try {
    const response = await serverApiClient.get('/api/v1/home/countries');
    // Ensure the response has the correct structure
    const data = response?.data?.data;
    if (data && Array.isArray(data)) {
      return {
        list: data,
        hasMoreCountries: false,
        countryPagination: { totalPages: 1, currentPage: 1, nextPage: null }
      };
    }
    return data || FALLBACK_DATA.countries;
  } catch (error) {
    console.warn('Countries API not available:', error.message);
    return FALLBACK_DATA.countries;
  }
};

export const getHomeCountriesV2API = async (params = {}) => {
  try {
    const response = await serverApiClient.get('/api/v1/home/countriesV2', { params });
    // Ensure the response has the correct structure
    const data = response?.data?.data;
    if (data && Array.isArray(data)) {
      return {
        list: data,
        hasMoreCountries: false,
        countryPagination: { totalPages: 1, currentPage: 1, nextPage: null }
      };
    }
    return data || FALLBACK_DATA.countries;
  } catch (error) {
    console.warn('Countries V2 API not available:', error.message);
    return FALLBACK_DATA.countries;
  }
};

export const getHomePartnersAPI = async () => {
  try {
    const response = await serverApiClient.get('/api/v1/home/partners', { 
      headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" } 
    });
    const data = response?.data?.data;
    // Ensure we return an array
    return Array.isArray(data) ? data : FALLBACK_DATA.partners;
  } catch (error) {
    console.warn('Partners API not available:', error.message);
    return FALLBACK_DATA.partners;
  }
};

export const getHomeSponsersAPI = async (params = {}) => {
  try {
    const response = await serverApiClient.get('/api/v1/home/sponsers', { 
      params, 
      headers: { 'Origin': process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" } 
    });
    const data = response?.data?.data;
    // Ensure we return the correct structure for sponsers
    if (data && typeof data === 'object') {
      return {
        heading: data.heading || 'Sponsored Websites',
        data: Array.isArray(data.data) ? data.data : []
      };
    }
    return FALLBACK_DATA.sponsers;
  } catch (error) {
    console.warn('Sponsers API not available:', error.message);
    return FALLBACK_DATA.sponsers;
  }
};

export const getPageCommonSettingsAPI = async () => {
  try {
    const response = await serverApiClient.get('/api/v1/page/commonSettings');
    return response?.data?.data;
  } catch (error) {
    console.warn('Common Settings API not available:', error.message);
    return FALLBACK_DATA.commonSettings;
  }
};
