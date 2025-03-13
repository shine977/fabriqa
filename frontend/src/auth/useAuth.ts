/**
 * Authentication Hooks
 *
 * React Hooks for authentication state management and operations
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { appPlugin } from '../plugins';
import { AuthState, LoginRequest, LoginResponse, User, loginApi, logoutApi, tokenStorage } from './auth.api';

/**
 * Main authentication hook
 * Provides authentication state and functions
 */
export function useAuth() {
  // Get initial auth state from storage
  const [authState, setAuthState] = useState<AuthState>(tokenStorage.getAuthState());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

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

  /**
   * Login function
   */
  const login = useCallback(
    async (credentials: LoginRequest, redirectTo?: string): Promise<LoginResponse> => {
      setLoading(true);
      try {
        const response = await loginApi(credentials);
        debugger;
        if (response) {
          // Store auth data
          tokenStorage.setAuthData(response.item.accessToken, response.item);

          // Update state
          setAuthState({
            isAuthenticated: true,
            token: response.item.accessToken,
            user: response.item,
          });

          // Trigger login success event
          appPlugin.applyHooks('auth:loginSuccess', response.item);

          // Success notification
          toast({
            title: '登录成功',
            description: `欢迎回来，${response.user.name}`,
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: 'top-right',
          });

          // Redirect after successful login
          if (redirectTo) {
            navigate(redirectTo);
          }
        } else {
          // Trigger login failed event
          appPlugin.applyHooks('auth:loginFailed', response);

          // Error notification
          toast({
            title: '登录失败',
            description: response.message || '用户名或密码错误',
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top-right',
          });
        }

        return response;
      } catch (error) {
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

        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
    [navigate, toast]
  );

  /**
   * Logout function
   */
  const logout = useCallback(
    (redirectPath: string = '/login') => {
      // Get current user before logout
      const user = authState.user;

      // Call logout API
      logoutApi(user);

      // Clear auth data
      tokenStorage.clearAuthData();

      // Update state
      setAuthState({
        isAuthenticated: false,
        token: null,
        user: null,
      });

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
      navigate(redirectPath);
    },
    [authState.user, navigate, toast]
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
    loading,
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
