/**
 * Auth Hooks
 *
 * This file contains React hooks for authentication using React Query.
 * It provides a complete authentication solution with loading states,
 * error handling, and proper data fetching.
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { authApi, LoginRequest, LoginResponse, User, tokenStorage } from './auth.api';
import { useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ApiResponse } from '../../types';

// Auth query keys
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

/**
 * Main authentication hook that provides all auth functionality
 */
export function useAuth() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local state for authentication status
  const [isInitialized, setIsInitialized] = useState(false);

  // Get the current user profile
  const profileQuery = useQuery({
    queryKey: authKeys.profile(),
    queryFn: authApi.getProfile,
    // enabled: !!tokenStorage.getAccessToken(),
    enabled: false,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: () => {
      // If profile fetch fails, clear token as it might be invalid
      if (tokenStorage.getAccessToken()) {
        tokenStorage.clearAll();
      }
    },
  });

  // Initialize authentication state
  useEffect(() => {
    if (!isInitialized) {
      // queryClient.invalidateQueries(authKeys.profile());
      setIsInitialized(true);
    }
  }, [isInitialized, queryClient]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data: ApiResponse<LoginResponse>) => {
      // Save auth
      tokenStorage.saveTokens(data.item.accessToken, data.item.refreshToken);
      // tokenStorage.saveUser(data.item);

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
    },
    onError: (error: any) => {
      // Show error message
      toast({
        title: t('login.failed'),
        description: error?.response?.data?.message || t('login.invalidCredentials'),
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      // Always clear local storage, even if the server call fails
      tokenStorage.clearAll();

      // Reset auth state
      // queryClient.resetQueries(authKeys.all);

      // Redirect to login
      navigate('/login');

      // Show success message
      toast({
        title: t('logout.success'),
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    },
  });

  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: data => {
      // Update access token
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        tokenStorage.saveTokens(data.accessToken, refreshToken);
      }

      // Refetch user profile with new token
      queryClient.invalidateQueries(authKeys.profile());
    },
    onError: () => {
      // If refresh fails, logout
      tokenStorage.clearAll();
      queryClient.resetQueries(authKeys.all);
      navigate('/login');
    },
  });

  /**
   * Login handler
   * @param credentials User credentials
   * @param redirectPath Path to redirect after successful login
   */
  const login = useCallback(
    (credentials: LoginRequest, redirectPath: string = '/') => {
      loginMutation.mutate(credentials, {
        onSuccess: () => {
          navigate(redirectPath, { replace: true });
        },
      });
    },
    [loginMutation, navigate]
  );

  /**
   * Logout handler
   */
  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!profileQuery.data;

  return {
    // User data
    user: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isAuthenticated,

    // Auth operations
    login,
    logout,
    refreshToken: refreshTokenMutation.mutate,

    // Detailed status for operations
    loginStatus: {
      isLoading: loginMutation.isPending,
      error: loginMutation.error,
    },
    logoutStatus: {
      isLoading: logoutMutation.isPending,
      error: logoutMutation.error,
    },

    // Raw query/mutation results for advanced usage
    profileQuery,
    loginMutation,
    logoutMutation,
    refreshTokenMutation,
  };
}

/**
 * Hook for protecting routes
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectPath = '/login') {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectPath]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook for login page
 * Redirects to home if already authenticated
 */
export function useRedirectAuthenticated(redirectPath = '/') {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectPath]);

  return { isAuthenticated, isLoading };
}
