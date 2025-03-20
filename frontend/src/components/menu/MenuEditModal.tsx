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
import {FormRefMethods} from '../Form'
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
    createMenu,
    updateMenu,
    isCreating,
    isUpdating,
    isLoadingUserMenus,
    userMenus,
    getMenuById,
  } = useMenu();
  
  // 当编辑现有菜单时，获取菜单详情
  const [menu, setMenu] = React.useState<MenuDto | null>(null);
  const [isLoadingMenu, setIsLoadingMenu] = React.useState(false);
  
  // 加载菜单数据
  React.useEffect(() => {
    if (menuId && isOpen) {
      setIsLoadingMenu(true);
      getMenuById(menuId)
        .then(item => {
          if (item) {
            setMenu(item);
          }
        })
        .catch(error => {
          console.error('Failed to load menu:', error);
          toast({
            title: t('menu:loadError'),
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        })
        .finally(() => {
          setIsLoadingMenu(false);
        });
    } else {
      // 创建新菜单时重置表单
      setMenu(null);
    }
  }, [menuId, isOpen]);
  
  
  const isSubmitting = isCreating || isUpdating;
  const formRef = React.useRef<FormRefMethods>(null);
  
  // Handle form submission
  const handleSubmit = async (values: any): Promise<void> => {
    try {
      // 确保values是正确格式的DTO对象
      const menuData = values as (CreateMenuDto | UpdateMenuDto)
      if (menuId) {
        // Update existing menu
        await updateMenu(menuId, menuData as UpdateMenuDto);
        toast({
          title: t('menu:updateSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new menu with parent ID if provided
        if (parentId) {
          menuData.parentId = parentId;
        }
        await createMenu(menuData as CreateMenuDto);
        toast({
          title: t('menu:createSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // 成功后触发回调
      if (onSuccess) {
        onSuccess();
      }
      
      // 不返回任何值
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
    if (!userMenus) return [];
    
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
      
      const descendantIds = findDescendantIds(menuId, userMenus);
      return userMenus.filter(m => m.id !== menuId && !descendantIds.includes(m.id));
    }
    
    return userMenus;
  };
  


  return (
    <EditModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      isSubmitting={isSubmitting}
      isViewOnly={isViewOnly}
      onSubmit={handleSubmit}
      size="2xl"
    >
      <MenuForm
      
        menu={menu}
        parentMenus={getParentMenuOptions()}
        isSubmitting={isSubmitting}
        isViewOnly={isViewOnly}
      />
    </EditModal>
  );
};

export default MenuEditModal;