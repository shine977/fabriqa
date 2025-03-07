/**
 * Auth Service
 * 
 * This service handles all authentication-related API calls to the backend.
 * It provides methods for login, logout, refresh token, and user profile.
 */

import { httpService } from '../http';

const API_ENDPOINT = '/auth';

// 登录请求参数接口
export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

// 登录响应接口
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

/**
 * AuthService - Provides methods for authentication
 */
class AuthService {
  /**
   * Login with username/email and password
   * @param credentials Login credentials
   * @returns Login response with tokens and user info
   */
  login(credentials: LoginRequest) {
    return httpService.post<LoginResponse>(`${API_ENDPOINT}/login`, credentials);
  }

  /**
   * Logout current user
   * @returns Success status
   */
  logout() {
    return httpService.post(`${API_ENDPOINT}/logout`);
  }

  /**
   * Refresh access token using refresh token
   * @returns New access token
   */
  refreshToken() {
    return httpService.post<{accessToken: string}>(`${API_ENDPOINT}/refresh`);
  }

  /**
   * Check if user is currently authenticated
   * @returns Boolean indicating auth status
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  /**
   * Get current user from localStorage
   * @returns Current user or null
   */
  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      return null;
    }
  }

  /**
   * Save auth data to localStorage
   * @param response Login response data
   */
  saveAuthData(response: LoginResponse): void {
    localStorage.setItem('auth_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  /**
   * Clear auth data from localStorage
   */
  clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}

export const authService = new AuthService();
export default authService;
