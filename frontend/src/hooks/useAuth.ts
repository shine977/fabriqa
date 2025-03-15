/**
 * Authentication Hooks
 *
 * React Hooks for authentication state management and operations
 * Enhanced with React Query for better state management and caching
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appPlugin } from '../plugins';
import { AuthState, LoginRequest, LoginResponse, User, loginApi, logoutApi, tokenStorage } from '../auth/auth.api';
import { useTranslation } from 'react-i18next';
import { ApiResponse } from '../types';

// Auth query keys for cache management
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

/**
 * Main authentication hook
 * Provides authentication state and functions with React Query
 */
export function useAuth() {
  // Get initial auth state from storage
  const [authState, setAuthState] = useState<AuthState>(tokenStorage.getAuthState());
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Update auth state when storage changes
  useEffect(() => {
    // Function to update auth state from storage
    const updateAuthState = () => {
      setAuthState(tokenStorage.getAuthState());
    };

    // Listen to storage events for multi-tab synchronization
    window.addEventListener('storage', updateAuthState);

    // Custom event for auth state changes
    window.addEventListener('authStateChanged', updateAuthState);

    return () => {
      window.removeEventListener('storage', updateAuthState);
      window.removeEventListener('authStateChanged', updateAuthState);
    };
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginApi.login,
    onSuccess: (data: ApiResponse<LoginResponse>) => {
      if (data && data.item) {
        tokenStorage.saveTokens(data.item.accessToken, data.item.refreshToken);
        tokenStorage.saveUser(data.item);
        setAuthState({
          isAuthenticated: true,
          token: data.item.accessToken,
          user: data.item,
        });
        // Invalidate queries to refetch user data
        // queryClient.invalidateQueries(authKeys.profile());

        // Show success message
        toast({
          title: t('login.success'),
          description: t('login.welcomeBack'),
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      } else {
        // Trigger login failed event
        appPlugin.applyHooks('auth:loginFailed', data);

        // Error notification
        toast({
          title: '登录失败',
          description: data.message || '用户名或密码错误',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
      }

      return data;
    },
    onError: (error: any) => {
      const errorMessage = error instanceof Error ? error.message : '登录过程中出错';

      // Error notification
      toast({
        title: '登录失败',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Get current user before logout
      const user = authState.user;
      return await logoutApi(user);
    },
    onSettled: () => {
      // Clear auth data regardless of API call success
      tokenStorage.clearAuthData();

      // Update state
      setAuthState({
        isAuthenticated: false,
        token: null,
        user: null,
      });

      // Clear any cached auth data
      // queryClient.invalidateQueries(authKeys.all);

      // Trigger logout success event
      appPlugin.applyHooks('auth:logoutSuccess', null);

      // Notification
      toast({
        title: '已退出登录',
        status: 'info',
        duration: 2000,
        isClosable: true,
        position: 'top-right',
      });

      // Redirect after logout
      navigate('/login');
    },
  });

  /**
   * Login handler
   * @param credentials User credentials
   * @param redirectTo Path to redirect after successful login
   */
  const login = useCallback(
    (credentials: LoginRequest, redirectTo: string = '/') => {
      loginMutation.mutate(credentials, {
        onSuccess: () => {
          navigate(redirectTo, { replace: true });
        },
      });
    },
    [loginMutation, navigate]
  );

  /**
   * Logout handler
   */
  const logout = useCallback(
    (redirectPath: string = '/login') => {
      logoutMutation.mutate(undefined, {
        onSettled: () => {
          navigate(redirectPath, { replace: true });
        },
      });
    },
    [logoutMutation, navigate]
  );
  return {
    // Auth state
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,

    // Auth operations
    login,
    logout,

    // UI states
    loading: loginMutation.isPending || logoutMutation.isPending,

    // Detailed status for operations
    loginStatus: {
      isLoading: loginMutation.isPending,
      error: loginMutation.error,
    },
    logoutStatus: {
      isLoading: logoutMutation.isPending,
      error: logoutMutation.error,
    },

    // Raw mutation results for advanced usage
    loginMutation,
    logoutMutation,
  };
}

/**
 * Hook for protecting routes
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  return useAuth();
}

/**
 * Hook for redirecting authenticated users
 * Useful for login/register pages
 */
export function useRedirectAuthenticated(redirectTo: string = '/') {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  return useAuth();
}
