# Authentication Service Refactoring Documentation

## Overview

This document outlines the comprehensive refactoring of the Fabriqa authentication system, transitioning from a class-based implementation to a modern React hooks-based approach using React Query. This refactoring enhances maintainability, testability, and follows current React best practices.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Key Components](#key-components)
3. [Implementation Details](#implementation-details)
4. [API Reference](#api-reference)
5. [Migration Guide](#migration-guide)
6. [Best Practices](#best-practices)
7. [Performance Considerations](#performance-considerations)

## Architecture Overview

### Previous Architecture

The authentication system previously used a class-based singleton pattern:

- `authService.ts`: Singleton class with methods for login, logout, and auth state management
- Direct localStorage access for token management
- Manual state updates and event handling
- Tight coupling with components

### New Architecture

The refactored architecture follows a modern, hooks-based approach:

- **Separation of Concerns**:
  - Pure API functions (`auth.api.ts`)
  - Token storage utilities
  - React hooks for state management (`useAuth.ts`)

- **React Query Integration**:
  - Efficient caching and state management
  - Automatic refetching and invalidation
  - Built-in loading and error states

- **Enhanced TypeScript Support**:
  - Comprehensive type definitions
  - Type-safe API functions and hooks

## Key Components

### 1. API Functions (`auth.api.ts`)

Pure API functions that handle authentication operations without UI concerns:

- `loginApi`: Handles login requests
- `logoutApi`: Performs logout operations
- `tokenStorage`: Utility for token management

### 2. React Hooks (`useAuth.ts`)

A collection of React hooks that provide authentication functionality:

- `useAuth()`: Main authentication hook for login/logout operations and state
- `useRequireAuth()`: Hook for protecting routes
- `useRedirectAuthenticated()`: Hook for redirecting authenticated users

### 3. Query Provider (`QueryProvider.tsx`)

React Query configuration and provider component:

- Optimal caching configuration
- Error handling setup
- Stale time and retry policy

## Implementation Details

### API Functions

```typescript
// auth.api.ts
export async function loginApi(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    // API call implementation
    // ...
    return processedResponse;
  } catch (error) {
    // Error handling
    // ...
    return errorResponse;
  }
}

export function logoutApi(user: User | null): void {
  // Logout implementation
  // ...
}

export const tokenStorage = {
  getAuthState(): AuthState {
    // Implementation
  },
  setAuthData(token: string, user: User): void {
    // Implementation
  },
  clearAuthData(): void {
    // Implementation
  }
};
```

### Authentication Hooks

```typescript
// useAuth.ts
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(tokenStorage.getAuthState());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  
  // Login function
  const login = useCallback(async (credentials, redirectTo) => {
    // Implementation
  }, [navigate, toast]);
  
  // Logout function
  const logout = useCallback((redirectPath = '/login') => {
    // Implementation
  }, [authState.user, navigate, toast]);
  
  return {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    login,
    logout,
    loading
  };
}

export function useRequireAuth(redirectTo = '/login') {
  // Implementation for route protection
}

export function useRedirectAuthenticated(redirectTo = '/') {
  // Implementation for redirecting authenticated users
}
```

### React Query Provider

```typescript
// QueryProvider.tsx
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

## API Reference

### `useAuth()` Hook

**Returns:**

- `user` (User | null): Current authenticated user
- `token` (string | null): Current authentication token
- `isAuthenticated` (boolean): Authentication status
- `login` (function): Authenticate user
- `logout` (function): Log out the current user
- `loading` (boolean): Loading state for operations

**Example Usage:**

```tsx
function LoginComponent() {
  const { login, loading } = useAuth();
  
  const handleSubmit = (credentials) => {
    login(credentials, '/dashboard');
  };
  
  return (
    <Button 
      isLoading={loading} 
      onClick={() => handleSubmit(formData)}
    >
      Login
    </Button>
  );
}
```

### `useRequireAuth()` Hook

**Parameters:**

- `redirectTo` (string, optional): Redirect path for unauthenticated users (default: '/login')

**Returns:**

- Same as `useAuth()` hook

**Example Usage:**

```tsx
function ProtectedComponent() {
  const { user } = useRequireAuth();
  
  return <UserDashboard userData={user} />;
}
```

### `useRedirectAuthenticated()` Hook

**Parameters:**

- `redirectTo` (string, optional): Redirect path for authenticated users (default: '/')

**Returns:**

- Same as `useAuth()` hook

**Example Usage:**

```tsx
function LoginPage() {
  // Redirects to home if already logged in
  useRedirectAuthenticated();
  
  return <LoginForm />;
}
```

## Migration Guide

### Updating Imports

**Before:**

```tsx
import { authService } from '../auth/authService';
```

**After:**

```tsx
import { useAuth } from '../auth/useAuth';
```

### Login Logic Changes

**Before:**

```tsx
const handleLogin = async () => {
  setLoading(true);
  try {
    const response = await authService.login(credentials);
    // Handle success
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

**After:**

```tsx
const { login, loading } = useAuth();

const handleLogin = () => {
  login(credentials, '/dashboard');
};
```

### Protected Routes

**Before:**

```tsx
function ProtectedRoute({ children }) {
  const { isAuthenticated } = authService.getAuthState();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
}
```

**After:**

```tsx
function ProtectedComponent() {
  const { user } = useRequireAuth();
  
  // If not authenticated, useRequireAuth will redirect automatically
  return <UserDashboard userData={user} />;
}
```

## Best Practices

1. **Don't Mix Approaches**:
   - Consistently use hooks-based approach
   - Avoid mixing with class-based authentication

2. **Proper Hook Usage**:
   - Follow React hooks rules
   - Avoid using authentication hooks outside React components

3. **Error Handling**:
   - Always handle login/logout errors
   - Use toast notifications for user feedback

4. **Token Management**:
   - Consider security implications of token storage
   - Implement token refresh when needed

5. **Code Organization**:
   - Keep API functions pure
   - Separate UI concerns from data fetching

## Performance Considerations

### React Query Benefits

1. **Caching**:
   - Reduces unnecessary API calls
   - Configurable stale time (currently 5 minutes)

2. **Background Updates**:
   - Updates data without blocking UI
   - Provides seamless user experience

3. **Request Deduplication**:
   - Prevents duplicate requests
   - Optimizes network usage

### When To Use React Query

React Query is most beneficial for:

1. Server state management
2. Data fetching with caching needs
3. Operations with loading/error states
4. Complex data dependencies

For simple state management without API calls, consider using useState or useReducer instead.

## Plugin System Integration

The authentication service is integrated with the application's plugin system:

```typescript
// Handling auth events
appPlugin.applyHooks('auth:loginSuccess', user);
appPlugin.applyHooks('auth:logoutSuccess', null);
```

This allows for extensibility through plugins that can react to authentication events.

---

*This documentation was last updated on March 17, 2025.*