import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig, AxiosInstance } from 'axios';
import JSONbig from 'json-bigint';
import { handleApiError } from './errorHandler';

/**
 * API Configuration
 * 
 * The API base URL is configured using environment variables:
 * - VITE_API_BASE_URL: The base URL for API requests
 * 
 * Environment-specific configuration is in:
 * - .env.development - Development environment (default: http://localhost:3000)
 * - .env.production - Production environment
 * - .env - Default fallback
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';



const localApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
  transformResponse: [(data) => JSONbig.parse(data)],
  timeout: 30000, // 30 seconds timeout for mobile networks
  withCredentials: false // We use Authorization header, not cookies
});



let accessToken: string | null = null;

/**
 * Returns the appropriate API instance based on the URL
 * Currently, we only have one API instance (localApi)
 * This function is designed to allow for multiple API instances in the future if needed
 */
const getApiInstance = (url: string): AxiosInstance => {
  return localApi;
};


/**
 * Check if the URL is for the refresh token endpoint to avoid infinite loops
 */
const isRefreshTokenEndpoint = (url: string): boolean => {
  return url.includes("api/auth/refresh");
};

const setupInterceptors = (apiInstance: typeof axios) => {
  apiInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {

      if (!accessToken) {
        accessToken = localStorage.getItem('accessToken');
      }
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
  );

  apiInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError): Promise<never> => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Only refresh token when we get a 401/403 error (token is invalid/expired)
      if (error.response?.status && [401, 403].includes(error.response.status) &&
          !originalRequest._retry &&
          originalRequest.url && !isRefreshTokenEndpoint(originalRequest.url)) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await localApi.post(`api/auth/refresh`, {
            refreshToken,
          });

          if (response.data.data) {
            const newAccessToken = response.data.data.accessToken;
            const newRefreshToken = response.data.data.refreshToken;

            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            accessToken = newAccessToken;

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
          } else {
            throw new Error('Invalid response from refresh token endpoint');
          }
          return getApiInstance(originalRequest.url || '')(originalRequest);
        } catch (err) {
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('accessToken');
          accessToken = null;
          window.location.href = '/login';
          return Promise.reject(handleApiError(err, { 
            showToast: true,
            defaultMessage: 'Authentication failed. Please log in again.'
          }));
        }
      }

      // Parse and handle the error consistently
      const apiError = handleApiError(error, { 
        logError: true,
        // Only show toast for non-auth errors (auth errors are handled by redirect)
        showToast: !(error.response?.status && [401, 403].includes(error.response.status))
      });

      return Promise.reject(apiError);
    }
  );
};

setupInterceptors(localApi);



const api = {
  request: (config: AxiosRequestConfig) => {
    const apiInstance = getApiInstance(config.url || '');
    return apiInstance(config);
  },
  get: (url: string, config?: AxiosRequestConfig) => {
    const apiInstance = getApiInstance(url);
    return apiInstance.get(url, config);
  },
  post: (url: string, data?: unknown, config?: AxiosRequestConfig) => {
    const apiInstance = getApiInstance(url);
    return apiInstance.post(url, data, config);
  },
  put: (url: string, data?: unknown, config?: AxiosRequestConfig) => {
    const apiInstance = getApiInstance(url);
    return apiInstance.put(url, data, config);
  },
  delete: (url: string, config?: AxiosRequestConfig) => {
    const apiInstance = getApiInstance(url);
    return apiInstance.delete(url, config);
  },
};

export default api;
