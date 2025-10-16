import axios from 'axios';
import { generateApiKey } from './helpers';
import { APP_CONFIG } from './constant';
import { getLoginData, logout, updateToken } from './auth';

const NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV || 'development';
const BASE_API_URI = APP_CONFIG[NODE_ENV]?.API_URI || '';
// Create an instance of Axios
const apiClient = axios.create({
  baseURL: BASE_API_URI,
  // timeout: 10000, // Timeout in milliseconds (10 seconds)
});

// Request interceptor for adding JWT token and x-api-key
apiClient.interceptors.request.use(
  async (config) => {
    const { token } = getLoginData(); // Assuming you store your JWT token in localStorage
    const apiKey = generateApiKey(); // Your static API key

    // Add Authorization header for JWT
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add x-api-key header
    config.headers['x-api-key'] = apiKey;

    return config;
  },
  (error) => {
    console.error('Request error:', error.message);
    return Promise.reject(error);
  },
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration and refresh
    if (error?.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = getLoginData();
        const apiKey = generateApiKey(); // Your static API key

        const response = await axios.post(
          `${BASE_API_URI}/api/v1/auth/refresh-token`,
          {
            token: refreshToken,
          },
          {
            headers: {
              'x-api-key': apiKey, // Add the API key in the headers
            },
          },
        );

        const { token } = response.data.data; // Assuming the response contains a new token

        // Update New Token
        updateToken(token);

        originalRequest.headers['Authorization'] = `Bearer ${token}`;

        return apiClient(originalRequest); // Retry the original request with new token
      } catch (refreshError) {
        const { code, message } = refreshError.response.data;
        console.error('Refresh token failed:', message || refreshError?.message);
        if (code == 'INVALID_REFRESH_TOKEN' || code == 'EXPIRED_REFRESH_TOKEN') {
          // Remove auth localstorage
          logout();
        }
      }
    }

    // Handle timeout errors explicitly
    if (error.code === 'ECONNABORTED') {
      console.error('A timeout occurred:', error.message);
    }

    // Log other errors without throwing a runtime error
    console.error('Axios response error:', error.message);

    // Prevent runtime errors from showing up as overlay
    return Promise.reject({
      ...error,
      message: 'An error occurred while processing your request. Please try again later.',
    });
  },
);

export default apiClient;
