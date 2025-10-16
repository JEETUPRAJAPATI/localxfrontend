import axios from 'axios';
import { generateApiKey } from './helpers';
import { APP_CONFIG } from './constant';

const NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV || 'development';
const BASE_API_URI = APP_CONFIG[NODE_ENV]?.API_URI || '';

// Create a server-side API client for getStaticProps
const serverApiClient = axios.create({
  baseURL: BASE_API_URI,
  timeout: 800, // Reduced to 800ms for ultra-fast failure
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
  (response) => {
    console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    const url = error.config?.url || 'unknown';
    const method = error.config?.method?.toUpperCase() || 'GET';
    
    if (error.code === 'ECONNABORTED') {
      console.warn(`⏰ API Timeout: ${method} ${url} - Using fallback data`);
    } else if (error.response) {
      console.warn(`❌ API Error: ${method} ${url} - Status: ${error.response.status} - Using fallback data`);
    } else {
      console.warn(`🔌 API Connection Error: ${method} ${url} - ${error.message} - Using fallback data`);
    }
    
    return Promise.reject(error);
  },
);

export default serverApiClient;
