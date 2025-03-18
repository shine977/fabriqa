/**
 * Menu Management Page
 * 
 * This component provides a UI for managing menu items, including:
 * - Displaying menus in a tree structure
 * - Creating new menu items
 * - Editing existing menu items
 * - Deleting menu items
 * - Adjusting menu order
 */
import React, { useState, useRef, useMemo } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  IconButton,
  Text,
  useDisclosure,
  useToast,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Spinner,
  HStack,
  Tag,
  useColorModeValue,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon, ArrowUpIcon, ArrowDownIcon } from '@chakra-ui/icons';
import { useMenu } from '../../hooks/useMenu';
import MenuEditModal from '../../components/menu/MenuEditModal';
import { MenuDto, MenuTypeEnum } from '../../api/menu';
import Table from '../../components/Table';
import { TableColumn } from '../../types';

/**
 * Menu Management Page Component
 */
const MenuManagement: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Menu modal state
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  
  // Delete confirmation dialog state
  const {
    isOpen: isDeleteDialogOpen,
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  // Menu data state
  const [selectedMenu, setSelectedMenu] = useState<string | undefined>(undefined);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(undefined);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<MenuDto | null>(null);
  
  // Fetch menu data
  const {
    menus,
    isLoadingMenus,
    menuError,
    deleteMenu,
    isDeleting,
    updateMenuOrder,
    isUpdatingOrder,
    refetchMenus,
  } = useMenu();
  
  // Action handlers
  const handleAddMenu = (parentId?: string) => {
    setSelectedMenu(undefined);
    setSelectedParentId(parentId);
    setIsViewOnly(false);
    onModalOpen();
  };
  
  const handleEditMenu = (menuId: string) => {
    setSelectedMenu(menuId);
    setSelectedParentId(undefined);
    setIsViewOnly(false);
    onModalOpen();
  };
  
  const handleViewMenu = (menuId: string) => {
    setSelectedMenu(menuId);
    setSelectedParentId(undefined);
    // setIsViewOnly(true);
    onModalOpen();
  };
  
  const handleDeleteMenu = (menu: MenuDto) => {
    setMenuToDelete(menu);
    onDeleteDialogOpen();
  };
  
  const confirmDeleteMenu = async () => {
    if (!menuToDelete) return;
    
    try {
      await deleteMenu(menuToDelete.id);
      toast({
        title: t('menu:deleteSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onDeleteDialogClose();
    } catch (error) {
      console.error('Failed to delete menu:', error);
      toast({
        title: t('menu:deleteFailed'),
        description: String(error),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleMoveMenu = async (menuId: string, direction: 'up' | 'down') => {
    if (!menus) return;
    
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return;
    
    // Find siblings (menus with the same parent)
    const siblings = menus.filter(m => m.parentId === menu.parentId);
    siblings.sort((a, b) => a.orderNum - b.orderNum);
    
    const currentIndex = siblings.findIndex(m => m.id === menuId);
    if (currentIndex === -1) return;
    
    let targetIndex;
    if (direction === 'up') {
      if (currentIndex === 0) return; // Already at the top
      targetIndex = currentIndex - 1;
    } else {
      if (currentIndex === siblings.length - 1) return; // Already at the bottom
      targetIndex = currentIndex + 1;
    }
    
    // Swap order numbers
    const targetMenu = siblings[targetIndex];
    const updatedMenus = [
      { id: menu.id, orderNum: targetMenu.orderNum },
      { id: targetMenu.id, orderNum: menu.orderNum },
    ];
    
    try {
      await updateMenuOrder(updatedMenus);
      toast({
        title: t('menu:orderUpdateSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to update menu order:', error);
      toast({
        title: t('menu:orderUpdateFailed'),
        description: String(error),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Helper function to render menu type badge
  const renderMenuTypeBadge = (type: MenuTypeEnum) => {
    let color;
    let label;
    
    switch (type) {
      case MenuTypeEnum.DIRECTORY:
        color = 'blue';
        label = t('menu:typeDirectory');
        break;
      case MenuTypeEnum.MENU:
        color = 'green';
        label = t('menu:typeMenu');
        break;
      case MenuTypeEnum.BUTTON:
        color = 'purple';
        label = t('menu:typeButton');
        break;
      default:
        color = 'gray';
        label = t('menu:typeUnknown');
    }
    
    return <Badge colorScheme={color}>{label}</Badge>;
  };
  
  // Helper function to render visibility and enabled status
  const renderStatusTags = (menu: MenuDto) => {
    return (
      <HStack spacing={2}>
        <Tag size="sm" colorScheme={menu.isVisible ? 'green' : 'red'}>
          {menu.isVisible ? t('menu:visible') : t('menu:hidden')}
        </Tag>
        <Tag size="sm" colorScheme={menu.isEnabled ? 'green' : 'red'}>
          {menu.isEnabled ? t('menu:enabled') : t('menu:disabled')}
        </Tag>
      </HStack>
    );
  };
  
  // 渲染操作按钮
  const renderActions = (menu: MenuDto) => {
    return (
      <HStack spacing={2}>
        <Tooltip label={t('common:view')}>
          <IconButton
            aria-label={t('common:view')}
            icon={<ViewIcon />}
            size="sm"
            variant="ghost"
            onClick={() => handleViewMenu(menu.id)}
          />
        </Tooltip>
        <Tooltip label={t('common:edit')}>
          <IconButton
            aria-label={t('common:edit')}
            icon={<EditIcon />}
            size="sm"
            variant="ghost"
            onClick={() => handleEditMenu(menu.id)}
          />
        </Tooltip>
        <Tooltip label={t('common:delete')}>
          <IconButton
            aria-label={t('common:delete')}
            icon={<DeleteIcon />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={() => handleDeleteMenu(menu)}
          />
        </Tooltip>
        <Tooltip label={t('menu:moveUp')}>
          <IconButton
            aria-label={t('menu:moveUp')}
            icon={<ArrowUpIcon />}
            size="sm"
            variant="ghost"
            isDisabled={isUpdatingOrder}
            onClick={() => handleMoveMenu(menu.id, 'up')}
          />
        </Tooltip>
        <Tooltip label={t('menu:moveDown')}>
          <IconButton
            aria-label={t('menu:moveDown')}
            icon={<ArrowDownIcon />}
            size="sm"
            variant="ghost"
            isDisabled={isUpdatingOrder}
            onClick={() => handleMoveMenu(menu.id, 'down')}
          />
        </Tooltip>
        <Tooltip label={t('menu:addSubMenu')}>
          <IconButton
            aria-label={t('menu:addSubMenu')}
            icon={<AddIcon />}
            size="sm"
            variant="ghost"
            colorScheme="blue"
            onClick={() => handleAddMenu(menu.id)}
          />
        </Tooltip>
      </HStack>
    );
  };
  
  // 定义表格列
  const columns: TableColumn[] = useMemo(() => [
    {
      id: 'name',
      header: t('menu:name'),
      accessor: 'name',
      render: (value, row, index) => (
        <Flex alignItems="center">
          {/* 根据层级缩进 */}
          {row._level > 0 && (
            <Box w={`${row._level * 8}px`} h="1px" />
          )}
          <Text fontWeight={row._level === 0 ? 'bold' : 'normal'}>
            {value}
          </Text>
        </Flex>
      )
    },
    {
      id: 'type',
      header: t('menu:type'),
      accessor: 'type',
      render: (value) => renderMenuTypeBadge(value)
    },
    {
      id: 'path',
      header: t('menu:path'),
      accessor: 'path',
      render: (value) => value || '-'
    },
    {
      id: 'component',
      header: t('menu:component'),
      accessor: 'component',
      render: (value) => value || '-'
    },
    {
      id: 'icon',
      header: t('menu:icon'),
      accessor: 'icon',
      render: (value) => value || '-'
    },
    {
      id: 'orderNum',
      header: t('menu:orderNum'),
      accessor: 'orderNum',
      isNumeric: true
    },
    {
      id: 'status',
      header: t('menu:status'),
      accessor: 'id',
      render: (value, row) => renderStatusTags(row)
    },
    {
      id: 'actions',
      header: t('common:actions'),
      accessor: 'id',
      render: (value, row) => renderActions(row)
    }
  ], [t, isUpdatingOrder]);
  
  // 处理菜单数据为扁平结构，并添加层级信息
  const flattenedMenus = useMemo(() => {
    if (!menus) return [];
    
    const result: (MenuDto & { _level: number })[] = [];
    
    const processList = (items: MenuDto[], parentId: string | null = null, level: number = 0) => {
      const filteredItems = items.filter(item => item.parentId === parentId);
      filteredItems.sort((a, b) => a.orderNum - b.orderNum);
      
      for (const item of filteredItems) {
        // 添加到结果数组，并附带层级信息
        result.push({ ...item, _level: level });
        // 递归处理子菜单
        processList(items, item.id, level + 1);
      }
    };
    
    processList(menus);
    return result;
  }, [menus]);
  
  return (
    <Box p={5}>
      <Card boxShadow="sm" bg={bgColor} borderColor={borderColor} borderWidth="1px">
        <CardHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Heading size="md">{t('menu:management')}</Heading>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={() => handleAddMenu()}
            >
              {t('menu:addRootMenu')}
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          {isLoadingMenus ? (
            <Flex justifyContent="center" alignItems="center" p={10}>
              <Spinner size="xl" />
            </Flex>
          ) : menuError ? (
            <Box textAlign="center" p={5} color="red.500">
              {t('common:loadError')}: {String(menuError)}
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table 
                columns={columns}
                data={flattenedMenus}
                rowKey="id"
                loading={isLoadingMenus}
                showSearch={true}
                showSettings={true}
                defaultSettings={{
                  density: 'compact',
                  stripedRows: true,
                  showBorders: true,
                  highlightOnHover: true
                }}
              />
            </Box>
          )}
        </CardBody>
      </Card>
      
      {/* Edit/Create Modal */}
      <MenuEditModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        menuId={selectedMenu}
        parentId={selectedParentId}
        onSuccess={refetchMenus}
        isViewOnly={isViewOnly}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteDialogClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('menu:deleteConfirmTitle')}
            </AlertDialogHeader>
            
            <AlertDialogBody>
              {t('menu:deleteConfirmMessage', { name: menuToDelete?.name })}
              {menuToDelete?.children && menuToDelete.children.length > 0 && (
                <Text color="red.500" mt={2}>
                  {t('menu:deleteChildrenWarning')}
                </Text>
              )}
            </AlertDialogBody>
            
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteDialogClose}>
                {t('common:cancel')}
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDeleteMenu}
                ml={3}
                isLoading={isDeleting}
              >
                {t('common:delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default MenuManagement;