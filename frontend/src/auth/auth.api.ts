/**
 * Authentication API
 *
 * Contains pure API functions for authentication operations
 */
import { appPlugin } from '../plugins';
import { ApiResponse } from '../types';

// Types
export interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
  [key: string]: any; // Allow other properties
}

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

// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';

/**
 * Token storage utility functions
 */
export const tokenStorage = {
  /**
   * Get authentication state from storage
   */
  getAuthState(): AuthState {
    const token = localStorage.getItem(TOKEN_KEY);
    const userString = localStorage.getItem(USER_KEY);

    // Check if plugin system has custom auth state handling
    return appPlugin.applyHooks('auth:getState', {
      isAuthenticated: Boolean(token && userString),
      user: userString ? JSON.parse(userString) : null,
      token,
    });
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
};

/**
 * Login API function
 */
export async function loginApi(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  try {
    console.log('Login request:', credentials);
    // This should be an actual API call
    // For demo purposes, using a mock login process

    // Mock successful login response

    // Allow plugins to process login response
    const processedResponse = appPlugin.applyHooks('auth:processLogin', loginResponse);

    return processedResponse;
  } catch (error) {
    // Handle login failure
    // const errorResponse: LoginResponse = {
    //   success: false,
    //   message: error instanceof Error ? error.message : 'Login failed, please try again',
    // };

    return errorResponse;
  }
}

/**
 * Logout API function
 */
export function logoutApi(user: User | null): void {
  // Allow plugins to execute operations before logout
  appPlugin.applyHooks('auth:beforeLogout', user);
}
