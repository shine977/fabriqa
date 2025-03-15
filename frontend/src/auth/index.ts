/**
 * Authentication Module Index
 *
 * Exports all authentication related functions and types
 */

// Export the hooks
export * from '../hooks/useAuth';
export { useAuth as default } from '../hooks/useAuth';

// Export the API functions and types
export * from './auth.api';
