/**
 * Authentication API
 *
 * Contains pure API functions for authentication operations
 */
import { appPlugin } from '../plugins';
import { httpService } from '../services/http';
import { ApiResponse } from '../types';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}
export interface Role {
  tenantId: string;
  createdBy: Date;
  updatedBy: Date;
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  deletedBy: string;
  isEnabled: boolean;
  orderNum: number;
  name: string;
  description: string;
  isSystem: boolean;
  code: string;
}
export interface LoginResponse {
  tenantId: string;
  createdBy: Date;
  updatedBy: Date;
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  deletedBy: string;
  isEnabled: boolean;
  orderNum: number;
  username: string;
  password: string;
  email: string;
  phone: string;
  avatar: string;
  type: string;
  isActive: boolean;
  refreshToken: string;
  lastLoginAt: Date;
  lastLoginIp: string;
  roles: Role[];
  accessToken: string;
}
// Types
export type User = LoginResponse;

const API_ENDPOINT = '/auth';
/**
 * Core authentication API functions
 */
export const loginApi = {
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

// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';

// Helper functions for token management
export const tokenStorage = {
  getAuthState(): AuthState {
    const token = localStorage.getItem(TOKEN_KEY);
    const userString = localStorage.getItem(USER_KEY);
    // Check if plugin system has custom auth state handling
    return {
      isAuthenticated: Boolean(token && userString),
      user: userString ? JSON.parse(userString) : null,
      token,
    };
  },
  /**
   * Store authentication data
   */
  setAuthData(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Clear authentication data
   */
  clearAuthData(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
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

/**
 * Logout API function
 */
export function logoutApi(user: User | null): void {
  // Allow plugins to execute operations before logout
  appPlugin.applyHooks('auth:beforeLogout', user);
}
