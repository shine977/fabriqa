/**
 * User Types
 * 
 * This file contains the type definitions for the user module.
 * It aligns with the backend DTOs to ensure type safety across the application.
 */

// User basic model
export interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  isAdmin?: boolean;
  adminLevel?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  remark?: string;
  tenantId?: string;
  roles?: UserRole[];
}

// User role model
export interface UserRole {
  id: string;
  name: string;
  description?: string;
}

// Create user DTO - matches backend CreateUserDto
export interface CreateUserDto {
  username: string;
  password: string;
  email?: string;
  isAdmin?: boolean;
  adminLevel?: number;
  phone?: string;
  isActive?: boolean;
  remark?: string;
  tenantId?: string;
  roleIds?: string[];
}

// Create tenant user DTO - matches backend CreateTenantUserDto
export interface CreateTenantUserDto {
  name: string;
  username: string;
  description?: string;
  password: string;
}

// Update user DTO - partial of create user DTO
export interface UpdateUserDto extends Partial<Omit<CreateUserDto, 'password'>> {
  password?: string; // Optional for updates
}

// User query parameters for filtering
export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  username?: string;
  email?: string;
  phone?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  tenantId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Role assignment DTO
export interface AssignRolesDto {
  roleIds: string[];
}

// Paginated response for users
export interface PaginatedUserResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// User with roles response
export interface UserWithRolesResponse {
  user: User;
  roles: UserRole[];
}
