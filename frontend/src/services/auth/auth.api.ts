/**
 * Auth API
 *
 * This file contains the core API functions for authentication.
 * These are pure API call functions without state management.
 */

import { httpService } from '../http';
import { ApiResponse } from '../types';

const API_ENDPOINT = '/auth';

// Login request interface
export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

// Login response interface
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email?: string;
    role: string;
    isActive: boolean;
  };
}

// User interface
export interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
  isActive: boolean;
}

/**
 * Core authentication API functions
 */
export const authApi = {
  /**
   * Login with username/email and password
   * @param credentials Login credentials
   * @returns Login response with tokens and user info
   */
  login: (credentials: LoginRequest) => {
    return httpService.post<ApiResponse<LoginResponse>>(`${API_ENDPOINT}/login`, credentials);
  },

  /**
   * Logout current user
   * @returns Success status
   */
  logout: () => {
    return httpService.post(`${API_ENDPOINT}/logout`);
  },

  /**
   * Refresh access token using refresh token
   * @returns New access token
   */
  refreshToken: () => {
    return httpService.post<{ accessToken: string }>(`${API_ENDPOINT}/refresh`);
  },

  /**
   * Get current user profile
   * @returns User profile data
   */
  getProfile: () => {
    return httpService.get<User>(`${API_ENDPOINT}/profile`);
  },
};

// Helper functions for token management
export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },

  saveTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },

  saveUser: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      return null;
    }
  },

  clearAll: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};
