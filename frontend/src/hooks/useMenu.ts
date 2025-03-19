/**
 * Menu Management Hooks
 *
 * React hooks for menu CRUD operations and state management
 * Enhanced with React Query for efficient caching and state management
 */
import { useCallback, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { menuApi, MenuDto, CreateMenuDto, UpdateMenuDto, UpdateMenuOrderDto } from '../api/menu';

// Menu query keys for cache management
export const menuKeys = {
  all: ['menus'] as const,
  lists: () => [...menuKeys.all, 'list'] as const,
  list: (filters: string) => [...menuKeys.lists(), { filters }] as const,
  details: () => [...menuKeys.all, 'detail'] as const,
  detail: (id: string) => [...menuKeys.details(), id] as const,
  userMenus: () => [...menuKeys.all, 'user'] as const,
};

/**
 * Hook for managing menu data and operations
 */
export function useMenu() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [selectedMenu, setSelectedMenu] = useState<MenuDto | null>(null);

  // Get all menus (tree structure)
  // const {
  //   data: menus,
  //   isLoading: isLoadingMenus,
  //   error: menuError,
  //   refetch: refetchMenus,
  // } = useQuery({
  //   queryKey: menuKeys.lists(),
  //   queryFn: async () => {
  //     const response = await menuApi.getAllMenus();
  //     return response.item || [];
  //   },
  //   staleTime: 60 * 1000, // 1 minute
  // });

  // Get user's menus
  const {
    data: userMenus,
    isLoading: isLoadingUserMenus,
    error: userMenuError,
    refetch: refetchUserMenus,
  } = useQuery({
    queryKey: menuKeys.userMenus(),
    queryFn: async () => {
      const response = await menuApi.getUserMenus();
      return response.items || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get menu by ID
  const getMenuById = useCallback(
    async (id: string) => {
      try {
        const response = await menuApi.getMenuById(id);
        return response.item;
      } catch (error) {
        console.error('Failed to get menu:', error);
        toast({
          title: t('common:error'),
          description: t('menu:getError'),
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
        return null;
      }
    },
    [toast, t]
  );

  // Create menu mutation
  const createMenuMutation = useMutation({
    mutationFn: menuApi.createMenu,
    onSuccess: data => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: menuKeys.userMenus() });

      // Success notification
      toast({
        title: t('menu:createSuccess'),
        description: t('menu:createSuccessDescription'),
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      return data;
    },
    onError: (error: any) => {
      const errorMessage = error?.message || t('menu:createError');

      // Error notification
      toast({
        title: t('common:error'),
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    },
  });

  // Update menu mutation
  const updateMenuMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuDto }) => menuApi.updateMenu(id, data),
    onSuccess: data => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: menuKeys.userMenus() });
      if (data.item?.id) {
        queryClient.invalidateQueries({ queryKey: menuKeys.detail(data.item.id) });
      }

      // Success notification
      toast({
        title: t('menu:updateSuccess'),
        description: t('menu:updateSuccessDescription'),
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      return data;
    },
    onError: (error: any) => {
      const errorMessage = error?.message || t('menu:updateError');

      // Error notification
      toast({
        title: t('common:error'),
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    },
  });

  // Delete menu mutation
  const deleteMenuMutation = useMutation({
    mutationFn: menuApi.deleteMenu,
    onSuccess: () => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });

      // Success notification
      toast({
        title: t('menu:deleteSuccess'),
        description: t('menu:deleteSuccessDescription'),
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || t('menu:deleteError');

      // Error notification
      toast({
        title: t('common:error'),
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    },
  });

  // Update menu order mutation
  const updateMenuOrderMutation = useMutation({
    mutationFn: menuApi.updateMenuOrder,
    onSuccess: () => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });

      // Success notification
      toast({
        title: t('menu:updateOrderSuccess'),
        description: t('menu:updateOrderSuccessDescription'),
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || t('menu:updateOrderError');

      // Error notification
      toast({
        title: t('common:error'),
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    },
  });

  /**
   * Create a new menu
   */
  const createMenu = useCallback(
    async (menuData: CreateMenuDto) => {
      return createMenuMutation.mutateAsync(menuData);
    },
    [createMenuMutation]
  );

  /**
   * Update an existing menu
   */
  const updateMenu = useCallback(
    async (id: string, menuData: UpdateMenuDto) => {
      return updateMenuMutation.mutateAsync({ id, data: menuData });
    },
    [updateMenuMutation]
  );

  /**
   * Delete a menu
   */
  const deleteMenu = useCallback(
    async (id: string) => {
      return deleteMenuMutation.mutateAsync(id);
    },
    [deleteMenuMutation]
  );

  /**
   * Update menu order
   */
  const updateMenuOrder = useCallback(
    async (orders: UpdateMenuOrderDto[]) => {
      return updateMenuOrderMutation.mutateAsync(orders);
    },
    [updateMenuOrderMutation]
  );

  return {
    // Data
    userMenus,
    selectedMenu,
    setSelectedMenu,

    // Status
    isLoadingUserMenus,
    isCreating: createMenuMutation.isPending,
    isUpdating: updateMenuMutation.isPending,
    isDeleting: deleteMenuMutation.isPending,
    isUpdatingOrder: updateMenuOrderMutation.isPending,

    // Errors

    userMenuError,

    // Actions
    refetchUserMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    updateMenuOrder,
  };
}

export default useMenu;
