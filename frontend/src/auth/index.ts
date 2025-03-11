/**
 * Authentication Module Index
 * 
 * Exports all authentication related functions and types
 */

// Export the hooks
export * from './useAuth';
export { useAuth as default } from './useAuth';

// Export the API functions and types
export * from './auth.api';