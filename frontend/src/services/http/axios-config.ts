/**
 * Axios Configuration
 *
 * This file contains the base configuration for axios HTTP client.
 * It sets up default headers, timeout, base URL and other global settings.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Environment specific API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Default axios configuration
const axiosConfig: AxiosRequestConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // Whether to send cookies with cross-domain requests
  withCredentials: false,
};

// Create axios instance with default configuration
const axiosInstance: AxiosInstance = axios.create(axiosConfig);

// Request interceptor
axiosInstance.interceptors.request.use(
  config => {
    // Get auth token from localStorage if it exists
    const token = localStorage.getItem('auth_token');

    // Add authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  <T>(response: AxiosResponse<T>) => {
    // Handle specific API response format (determine item or items)
    const data = response.data;

    // If not a standard API response format, return original data
    if (data === null || data === undefined || typeof data !== 'object' || !('code' in data)) {
      return response;
    }
    return data;
  },
  error => {
    // Default error handling
    const { response } = error;

    // Handle token expiration - 401 Unauthorized
    if (response && response.status === 401) {
      // Clear authentication data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      // Redirect to login page (if using window)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Handle other error statuses if needed
    // if (response && response.status === 403) { // Forbidden
    //   // Handle 403 Forbidden error
    // }

    return Promise.reject(error);
  }
);

export default axiosInstance;
