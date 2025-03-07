/**
 * User Management Page
 * 
 * This page provides a comprehensive user management interface.
 * Features include:
 * - List users with pagination and sorting
 * - Search and filter users
 * - Create new users
 * - Edit existing users
 * - Delete users (single and batch)
 * - Change user status (activate/deactivate)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Flex,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tag,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  AddIcon, 
  DeleteIcon, 
  EditIcon, 
  RepeatIcon,
  CheckIcon,
  CloseIcon,
  ChevronDownIcon,
  DownloadIcon,
  LockIcon,
  UnlockIcon,
} from '@chakra-ui/icons';
import { FaEllipsisV } from 'react-icons/fa';
import Page from '../../components/Page';
import Table from '../../components/Table';
import { userService, User, UserQueryParams } from '../../services/user';
import UserForm from './UserForm';
import { useTranslation } from 'react-i18next';
import { TableColumn } from '../../types';
import { format } from 'date-fns';

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const formDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const deleteBatchDisclosure = useDisclosure();
  const tableContainerBg = useColorModeValue('white', 'gray.800');
  const colorScheme = useColorModeValue('blue', 'teal');

  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [queryParams, setQueryParams] = useState<UserQueryParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [total, setTotal] = useState(0);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // Fetch users with current search and pagination
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Apply search term to query params
      const params: UserQueryParams = {
        ...queryParams,
        ...(searchTerm ? { username: searchTerm } : {}),
      };
      
      const response = await userService.getUsers(params);
      setUsers(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: t('common.error'),
        description: t('user.fetchError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [queryParams, searchTerm, toast, t]);

  // Load users on component mount and when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle pagination change
  const handlePageChange = (page: number, pageSize: number) => {
    setQueryParams(prev => ({
      ...prev,
      page,
      pageSize,
    }));
  };

  // Handle search
  const handleSearch = () => {
    // Reset to first page when searching
    setQueryParams(prev => ({
      ...prev,
      page: 1,
    }));
  };

  // Open form for creating a new user
  const handleCreateUser = () => {
    setSelectedUser(null);
    formDisclosure.onOpen();
  };

  // Open form for editing an existing user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    formDisclosure.onOpen();
  };

  // Confirm delete dialog for a single user
  const handleDeleteConfirm = (user: User) => {
    setSelectedUser(user);
    deleteDisclosure.onOpen();
  };

  // Execute user deletion
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      await userService.deleteUser(selectedUser.id);
      toast({
        title: t('common.success'),
        description: t('user.deleteSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: t('common.error'),
        description: t('user.deleteError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      deleteDisclosure.onClose();
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (user: User) => {
    setIsLoading(true);
    try {
      await userService.setUserStatus(user.id, !user.isActive);
      toast({
        title: t('common.success'),
        description: user.isActive ? t('user.deactivateSuccess') : t('user.activateSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: t('common.error'),
        description: t('user.statusUpdateError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk delete selected users
  const handleBulkDelete = async () => {
    setIsLoading(true);
    try {
      await userService.bulkDeleteUsers(selectedUserIds);
      toast({
        title: t('common.success'),
        description: t('user.bulkDeleteSuccess', { count: selectedUserIds.length }),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setSelectedUserIds([]);
      fetchUsers();
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      toast({
        title: t('common.error'),
        description: t('user.bulkDeleteError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      deleteBatchDisclosure.onClose();
    }
  };

  // Export users list to file
  const handleExportUsers = async () => {
    try {
      // Apply search and filters to export
      const params: UserQueryParams = {
        ...queryParams,
        ...(searchTerm ? { username: searchTerm } : {}),
        // Remove pagination for export
        page: undefined,
        pageSize: undefined,
      };
      
      toast({
        title: t('common.processing'),
        description: t('user.exportProcessing'),
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
      await userService.exportUsers(params);
      
      toast({
        title: t('common.success'),
        description: t('user.exportSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error exporting users:', error);
      toast({
        title: t('common.error'),
        description: t('user.exportError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Table columns definition
  const columns: TableColumn[] = [
    {
      id: 'username',
      header: t('user.username'),
      accessor: 'username',
      cell: (value: string, row: User) => (
        <Box>
          <Text fontWeight="medium">{value}</Text>
          {row.email && (
            <Text fontSize="sm" color="gray.500">
              {row.email}
            </Text>
          )}
        </Box>
      ),
      isSortable: true,
    },
    {
      id: 'roles',
      header: t('user.roles'),
      accessor: 'roles',
      cell: (roles: any, row: User) => (
        <HStack spacing={1}>
          {row.isAdmin && (
            <Badge colorScheme="red" variant="solid" fontSize="xs" px={2} py={1} borderRadius="full">
              {t('user.admin')} {row.adminLevel ? `(${row.adminLevel})` : ''}
            </Badge>
          )}
          {roles?.map((role: any) => (
            <Badge key={role.id} colorScheme="blue" variant="outline" fontSize="xs" px={2} py={1} borderRadius="full">
              {role.name}
            </Badge>
          ))}
          {(!roles || roles.length === 0) && !row.isAdmin && (
            <Badge colorScheme="gray" variant="outline" fontSize="xs" px={2} py={1} borderRadius="full">
              {t('user.noRoles')}
            </Badge>
          )}
        </HStack>
      ),
    },
    {
      id: 'phone',
      header: t('user.phone'),
      accessor: 'phone',
      cell: (text: string) => text || '-',
    },
    {
      id: 'isActive',
      header: t('user.status'),
      accessor: 'isActive',
      cell: (isActive: boolean) => (
        <Tag
          colorScheme={isActive ? 'green' : 'red'}
          borderRadius="full"
          size="sm"
          variant="solid"
          px={3}
          py={1}
        >
          {isActive ? t('user.active') : t('user.inactive')}
        </Tag>
      ),
    },
    {
      id: 'createdAt',
      header: t('user.createdAt'),
      accessor: 'createdAt',
      cell: (date: string) => date ? format(new Date(date), 'yyyy-MM-dd HH:mm') : '-',
      isSortable: true,
    },
    {
      id: 'actions',
      header: t('common.actions'),
      accessor: '',
      width: '120px',
      cell: (_, row: User) => (
        <HStack spacing={1}>
          <Tooltip label={t('common.edit')}>
            <IconButton
              aria-label={t('common.edit')}
              icon={<EditIcon />}
              size="sm"
              variant="ghost"
              colorScheme="blue"
              onClick={() => handleEditUser(row)}
            />
          </Tooltip>
          <Menu>
            <Tooltip label={t('common.more')}>
              <MenuButton
                as={IconButton}
                aria-label={t('common.more')}
                icon={<FaEllipsisV />}
                size="sm"
                variant="ghost"
              />
            </Tooltip>
            <MenuList minW="160px">
              <MenuItem
                icon={row.isActive ? <LockIcon /> : <UnlockIcon />}
                onClick={() => handleToggleStatus(row)}
              >
                {row.isActive ? t('user.deactivate') : t('user.activate')}
              </MenuItem>
              <MenuItem
                icon={<DeleteIcon />}
                color="red.500"
                onClick={() => handleDeleteConfirm(row)}
              >
                {t('common.delete')}
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      ),
    },
  ];

  // Page header with search and action buttons
  const headerContent = (
    <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} w="full" gap={4}>
      <InputGroup maxW={{ base: "full", md: "320px" }}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder={t('user.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          variant="filled"
          _focus={{
            borderColor: `${colorScheme}.400`,
            boxShadow: `0 0 0 1px ${colorScheme}.400`,
          }}
        />
      </InputGroup>
      
      <HStack spacing={2}>
        <Button
          leftIcon={<RepeatIcon />}
          onClick={fetchUsers}
          variant="ghost"
          size="md"
        >
          {t('common.refresh')}
        </Button>
        
        <Button
          leftIcon={<DownloadIcon />}
          onClick={handleExportUsers}
          variant="outline"
          size="md"
          isDisabled={users.length === 0}
        >
          {t('common.export')}
        </Button>
        
        <Button
          leftIcon={<AddIcon />}
          onClick={handleCreateUser}
          colorScheme={colorScheme}
          size="md"
        >
          {t('user.createUser')}
        </Button>
      </HStack>
    </Flex>
  );

  return (
    <Page 
      title={t('user.management')} 
      headerContent={headerContent}
      loading={false}
    >
      <Box 
        bg={tableContainerBg} 
        borderRadius="md" 
        overflow="hidden"
        boxShadow="sm"
        transition="all 0.2s"
      >
        <Box p={4}>
          <HStack justify="space-between" mb={4}>
            {selectedUserIds.length > 0 ? (
              <HStack spacing={2}>
                <Button
                  leftIcon={<DeleteIcon />}
                  colorScheme="red"
                  size="sm"
                  variant="outline"
                  onClick={deleteBatchDisclosure.onOpen}
                >
                  {t('user.bulkDelete', { count: selectedUserIds.length })}
                </Button>
              </HStack>
            ) : (
              <Box />
            )}
          </HStack>
          
          <Table
            columns={columns}
            data={users}
            loading={isLoading}
            pagination={{
              currentPage: queryParams.page || 1,
              pageSize: queryParams.pageSize || 10,
              total,
              onChange: handlePageChange,
            }}
            rowSelection={{
              selectedRowKeys: selectedUserIds,
              onChange: (selectedRowKeys) => setSelectedUserIds(selectedRowKeys as string[]),
            }}
            rowKey="id"
            defaultSettings={{
              density: 'comfortable',
              stripedRows: true,
              showBorders: false,
              highlightOnHover: true,
            }}
          />
        </Box>
      </Box>

      {/* User Form Modal */}
      <UserForm 
        isOpen={formDisclosure.isOpen}
        onClose={formDisclosure.onClose}
        userId={selectedUser?.id}
        onSuccess={fetchUsers}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDisclosure.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteDisclosure.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('user.deleteTitle')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('user.deleteConfirm', { username: selectedUser?.username })}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={deleteDisclosure.onClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" onClick={handleDeleteUser} ml={3} isLoading={isLoading}>
                {t('common.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteBatchDisclosure.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={deleteBatchDisclosure.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('user.bulkDeleteTitle')}
            </AlertDialogHeader>

            <AlertDialogBody>
              {t('user.bulkDeleteConfirm', { count: selectedUserIds.length })}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={deleteBatchDisclosure.onClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" onClick={handleBulkDelete} ml={3} isLoading={isLoading}>
                {t('common.delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Page>
  );
};

export default UserManagement;
