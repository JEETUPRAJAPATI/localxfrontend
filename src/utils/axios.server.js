import axios from 'axios';
import { generateApiKey } from './helpers';
import { APP_CONFIG } from './constant';

const NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV || 'development';
const BASE_API_URI = APP_CONFIG[NODE_ENV]?.API_URI || '';

// Create a server-side API client for getStaticProps
const serverApiClient = axios.create({
  baseURL: BASE_API_URI,
  timeout: 2000, // Reduced to 2 seconds to prevent blocking
});

// Request interceptor for server-side requests
serverApiClient.interceptors.request.use(
  async (config) => {
    const apiKey = generateApiKey(); // Your static API key
    
    // Add x-api-key header
    config.headers['x-api-key'] = apiKey;
    
    // Add Origin header for server-side requests
    config.headers['Origin'] = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    return config;
  },
  (error) => {
    console.error('Server request error:', error.message);
    return Promise.reject(error);
  },
);

// Response interceptor for server-side requests
serverApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Server API error:', error.message);
    return Promise.reject(error);
  },
);

export default serverApiClient;
