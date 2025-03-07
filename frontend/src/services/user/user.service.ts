/**
 * User Service
 * 
 * This service handles all user-related API calls to the backend.
 * It utilizes the HTTP service to make requests and provides type-safe methods
 * for managing users, including CRUD operations and role assignments.
 */

import { Observable } from 'rxjs';
import { httpService } from '../http';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserQueryParams,
  PaginatedUserResponse,
  AssignRolesDto,
  UserWithRolesResponse,
  CreateTenantUserDto
} from './user.types';

// Base API endpoint for user module
const API_ENDPOINT = '/user';

/**
 * UserService - Provides methods for interacting with the user API
 */
class UserService {
  /**
   * Create a new user
   * @param userData - User data for creation
   * @returns Promise with the created user
   */
  async createUser(userData: CreateUserDto): Promise<User> {
    return httpService.post<User>(API_ENDPOINT, userData);
  }

  /**
   * Create a new tenant user
   * @param tenantUserData - Tenant user data for creation
   * @returns Promise with the created tenant user
   */
  async createTenantUser(tenantUserData: CreateTenantUserDto): Promise<User> {
    return httpService.post<User>(`${API_ENDPOINT}/tenant`, tenantUserData);
  }

  /**
   * Get all users with optional pagination and filtering
   * @param queryParams - Optional query parameters for filtering and pagination
   * @returns Promise with paginated user response
   */
  async getUsers(queryParams: UserQueryParams = {}): Promise<PaginatedUserResponse> {
    return httpService.get<PaginatedUserResponse>(API_ENDPOINT, queryParams);
  }

  /**
   * Get users with rxjs Observable for more complex scenarios
   * @param queryParams - Optional query parameters
   * @returns Observable of paginated user response
   */
  getUsersWithRx(queryParams: UserQueryParams = {}): Observable<PaginatedUserResponse> {
    return httpService.getWithRx<PaginatedUserResponse>(API_ENDPOINT, queryParams, {
      cacheResponse: true,
      cacheTime: 30000 // Cache for 30 seconds
    });
  }

  /**
   * Get a single user by ID
   * @param userId - The ID of the user to fetch
   * @returns Promise with the user data
   */
  async getUserById(userId: string): Promise<User> {
    return httpService.get<User>(`${API_ENDPOINT}/${userId}`);
  }

  /**
   * Get a single user with rxjs Observable
   * @param userId - The ID of the user to fetch
   * @returns Observable of user data
   */
  getUserByIdWithRx(userId: string): Observable<User> {
    return httpService.getWithRx<User>(`${API_ENDPOINT}/${userId}`, null, {
      cacheResponse: true,
      cacheTime: 60000 // Cache for 1 minute
    });
  }

  /**
   * Update a user
   * @param userId - The ID of the user to update
   * @param userData - The data to update
   * @returns Promise with the updated user
   */
  async updateUser(userId: string, userData: UpdateUserDto): Promise<User> {
    return httpService.patch<User>(`${API_ENDPOINT}/${userId}`, userData);
  }

  /**
   * Delete a user
   * @param userId - The ID of the user to delete
   * @returns Promise with the deletion result
   */
  async deleteUser(userId: string): Promise<any> {
    return httpService.delete(`${API_ENDPOINT}/${userId}`);
  }

  /**
   * Assign roles to a user
   * @param userId - The ID of the user
   * @param roleIds - Array of role IDs to assign
   * @returns Promise with the result
   */
  async assignRoles(userId: string, roleIds: string[]): Promise<any> {
    const assignRolesDto: AssignRolesDto = { roleIds };
    return httpService.post(`${API_ENDPOINT}/${userId}/roles`, assignRolesDto);
  }

  /**
   * Get user with their roles
   * @param userId - The ID of the user
   * @returns Promise with user and roles data
   */
  async getUserRoles(userId: string): Promise<UserWithRolesResponse> {
    return httpService.get<UserWithRolesResponse>(`${API_ENDPOINT}/${userId}/roles`);
  }

  /**
   * Get user with their roles using rxjs Observable
   * @param userId - The ID of the user
   * @returns Observable of user and roles data
   */
  getUserRolesWithRx(userId: string): Observable<UserWithRolesResponse> {
    return httpService.getWithRx<UserWithRolesResponse>(`${API_ENDPOINT}/${userId}/roles`);
  }

  /**
   * Get current user profile
   * @returns Promise with the current user's data
   */
  async getCurrentUser(): Promise<User> {
    return httpService.get<User>(`${API_ENDPOINT}/profile`);
  }

  /**
   * Update current user's profile
   * @param userData - The data to update
   * @returns Promise with the updated user
   */
  async updateCurrentUser(userData: UpdateUserDto): Promise<User> {
    return httpService.patch<User>(`${API_ENDPOINT}/profile`, userData);
  }

  /**
   * Change current user's password
   * @param oldPassword - Current password
   * @param newPassword - New password
   * @returns Promise with the result
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<any> {
    return httpService.post(`${API_ENDPOINT}/change-password`, {
      oldPassword,
      newPassword
    });
  }

  /**
   * Activate or deactivate a user
   * @param userId - The ID of the user
   * @param isActive - Whether to activate or deactivate
   * @returns Promise with the updated user
   */
  async setUserStatus(userId: string, isActive: boolean): Promise<User> {
    return httpService.patch<User>(`${API_ENDPOINT}/${userId}`, { isActive });
  }

  /**
   * Export users list to CSV/Excel
   * @param queryParams - Optional query parameters for filtering
   * @returns Promise with blob data for the file
   */
  async exportUsers(queryParams: UserQueryParams = {}): Promise<Blob> {
    return httpService.downloadFile(`${API_ENDPOINT}/export`, `users_export_${new Date().toISOString()}.xlsx`, {
      params: queryParams,
      responseType: 'blob'
    });
  }

  /**
   * Bulk delete multiple users
   * @param userIds - Array of user IDs to delete
   * @returns Promise with the deletion result
   */
  async bulkDeleteUsers(userIds: string[]): Promise<any> {
    return httpService.post(`${API_ENDPOINT}/bulk-delete`, { userIds });
  }
}

// Create and export singleton instance
export const userService = new UserService();
export default userService;
