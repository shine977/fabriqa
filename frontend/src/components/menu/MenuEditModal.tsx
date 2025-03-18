/**
 * Menu Edit Modal Component
 * 
 * Modal component for editing menu items
 * Uses the generic EditModal component with a specialized MenuForm
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@chakra-ui/react';
import EditModal from '../EditModal';
import MenuForm from './MenuForm';
import { useMenu } from '../../hooks/useMenu';
import { MenuDto, CreateMenuDto, UpdateMenuDto } from '../../api/menu';

interface MenuEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuId?: string;
  parentId?: string;
  onSuccess?: () => void;
  isViewOnly?: boolean;
}

/**
 * Modal component for creating and editing menu items
 */
const MenuEditModal: React.FC<MenuEditModalProps> = ({
  isOpen,
  onClose,
  menuId,
  parentId,
  onSuccess,
  isViewOnly = false,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  
  const {
    menu,
    isLoadingMenu,
    menus,
    isLoadingMenus,
    createMenu,
    updateMenu,
    isCreatingMenu,
    isUpdatingMenu,
  } = useMenu(menuId);
  
  const isSubmitting = isCreatingMenu || isUpdatingMenu;
  const isLoading = isLoadingMenu || isLoadingMenus;
  
  // Handle form submission
  const handleSubmit = async (values: CreateMenuDto | UpdateMenuDto) => {
    try {
      if (menuId) {
        // Update existing menu
        await updateMenu(menuId, values as UpdateMenuDto);
        toast({
          title: t('menu:updateSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new menu with parent ID if provided
        if (parentId) {
          values.parentId = parentId;
        }
        await createMenu(values as CreateMenuDto);
        toast({
          title: t('menu:createSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // 成功后触发回调，但不关闭模态框（由EditModal处理）
      if (onSuccess) {
        onSuccess();
      }
      
      // 返回成功结果
      return true;
    } catch (error) {
      console.error('Failed to save menu:', error);
      toast({
        title: menuId ? t('menu:updateFailed') : t('menu:createFailed'),
        description: String(error),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      // 重新抛出错误，这样EditModal可以捕获到失败
      throw error;
    }
  };
  
  // Get title based on operation (create, edit, view)
  const getTitle = () => {
    if (isViewOnly) {
      return t('menu:viewMenu');
    }
    return menuId ? t('menu:editMenu') : t('menu:createMenu');
  };
  
  // Filter out potential menu's children and self from parent options
  const getParentMenuOptions = () => {
    if (!menus) return [];
    
    // When editing, we need to exclude the current menu and its children
    if (menuId) {
      // Function to recursively find all descendant IDs
      const findDescendantIds = (menuId: string, menuList: MenuDto[]): string[] => {
        const children = menuList.filter(m => m.parentId === menuId);
        if (children.length === 0) return [];
        
        return children.reduce((ids, child) => {
          return [...ids, child.id, ...findDescendantIds(child.id, menuList)];
        }, [] as string[]);
      };
      
      const descendantIds = findDescendantIds(menuId, menus);
      return menus.filter(m => m.id !== menuId && !descendantIds.includes(m.id));
    }
    
    return menus;
  };
  
  // 创建一个包装函数来适配EditModal的onSubmit调用
  const handleModalSubmit = async () => {
    // 表单的提交将在Form组件内部处理
    // 这个函数只是为了让EditModal能正确调用
    return Promise.resolve();
  };

  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      isSubmitting={isSubmitting}
      isViewOnly={isViewOnly}
      onSubmit={handleModalSubmit}
      size="2xl"
    >
      <MenuForm
        menu={menu}
        parentMenus={getParentMenuOptions()}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isViewOnly={isViewOnly}
      />
    </EditModal>
  );
};

export default MenuEditModal;