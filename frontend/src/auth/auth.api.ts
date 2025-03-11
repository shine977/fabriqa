/**
 * Authentication API
 *
 * Contains pure API functions for authentication operations
 */
import { appPlugin } from '../plugins';

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

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
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
export async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    // This should be an actual API call
    // For demo purposes, using a mock login process
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful login response
    const loginResponse: LoginResponse = {
      success: true,
      token: 'demo_token_' + Math.random().toString(36).substring(2),
      user: {
        id: 1,
        name: 'Admin User',
        email: credentials.email,
        role: 'admin',
        avatar: 'https://i.pravatar.cc/150?u=' + credentials.email,
      },
    };

    // Allow plugins to process login response
    const processedResponse = appPlugin.applyHooks('auth:processLogin', loginResponse);

    return processedResponse;
  } catch (error) {
    // Handle login failure
    const errorResponse: LoginResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Login failed, please try again',
    };

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
