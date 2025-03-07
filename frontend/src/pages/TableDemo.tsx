/**
 * Table Demo Page
 * 
 * 展示数据表格组件的功能和与插件系统的集成
 */

import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  HStack,
  Badge,
  Avatar,
  useColorModeValue,
  Switch,
  Grid,
  GridItem,
  Flex,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Tooltip,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, ViewIcon, SettingsIcon } from '@chakra-ui/icons';
import Page from '../components/Page';
import Table from '../components/Table';
import { TableColumn } from '../types';

// 模拟用户数据
const mockUsers = Array.from({ length: 50 }).map((_, index) => ({
  id: `user-${index + 1}`,
  name: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  status: ['active', 'inactive', 'suspended', 'pending'][Math.floor(Math.random() * 4)],
  role: ['Admin', 'Editor', 'Viewer', 'Guest'][Math.floor(Math.random() * 4)],
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
  lastLogin: Math.random() > 0.2 ? new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString() : null,
}));

const TableDemo: React.FC = () => {
  // 分页状态
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: mockUsers.length,
  });
  
  // 行选择状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  
  // 加载状态
  const [loading, setLoading] = useState(false);
  
  // 列定义
  const columns: TableColumn[] = [
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
      width: '150px',
      sorter: true,
      render: (text, record) => (
        <HStack spacing={2}>
          <Avatar name={text} size="sm" />
          <Text fontWeight="medium">{text}</Text>
        </HStack>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: '100px',
      sorter: true,
      render: (role) => {
        const colorScheme = {
          'Admin': 'red',
          'Editor': 'green',
          'Viewer': 'blue',
          'Guest': 'gray',
        }[role] || 'gray';
        
        return (
          <Badge colorScheme={colorScheme} variant="subtle" px={2} py={1} borderRadius="md">
            {role}
          </Badge>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '100px',
      sorter: true,
      render: (status) => {
        const colorScheme = {
          'active': 'green',
          'inactive': 'gray',
          'suspended': 'red',
          'pending': 'yellow',
        }[status] || 'gray';
        
        return (
          <Badge colorScheme={colorScheme} variant="solid" px={2} py={1} borderRadius="md">
            {status}
          </Badge>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '150px',
      sorter: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: '150px',
      sorter: true,
      render: (date) => date ? new Date(date).toLocaleDateString() : '从未登录',
    },
    {
      title: '操作',
      key: 'actions',
      width: '100px',
      fixed: 'right',
      render: (_, record) => (
        <Menu>
          <MenuButton
            as={IconButton}
            size="sm"
            aria-label="操作"
            icon={<SettingsIcon />}
            variant="ghost"
          />
          <MenuList>
            <MenuItem icon={<ViewIcon />}>查看</MenuItem>
            <MenuItem icon={<EditIcon />}>编辑</MenuItem>
            <MenuItem icon={<DeleteIcon color="red.500" />} color="red.500">
              删除
            </MenuItem>
          </MenuList>
        </Menu>
      ),
    },
  ];
  
  // 处理页面变化
  const handlePageChange = (page: number, pageSize: number) => {
    setLoading(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      setPagination({
        ...pagination,
        currentPage: page,
      });
      setLoading(false);
    }, 300);
  };
  
  // 处理行选择变化
  const handleRowSelectionChange = (selectedRowKeys: string[], selectedRows: any[]) => {
    setSelectedRowKeys(selectedRowKeys);
    console.log('选择的行:', selectedRows);
  };
  
  // 获取当前页数据
  const getCurrentPageData = () => {
    const { currentPage, pageSize } = pagination;
    const startIndex = (currentPage - 1) * pageSize;
    return mockUsers.slice(startIndex, startIndex + pageSize);
  };
  
  // 设置颜色
  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Page title="数据表格示例">
      <Box mb={5}>
        <Text fontSize="lg" mb={3}>
          这个页面展示了数据表格组件的功能，包括排序、过滤、分页和行选择。表格组件与插件系统深度集成，
          允许通过插件扩展表格功能。
        </Text>
        
        <HStack spacing={4} mb={5}>
          <Button colorScheme="blue" leftIcon={<AddIcon />}>
            添加用户
          </Button>
          <Button
            colorScheme="red"
            variant="outline"
            leftIcon={<DeleteIcon />}
            isDisabled={selectedRowKeys.length === 0}
          >
            删除所选 ({selectedRowKeys.length})
          </Button>
        </HStack>
        
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4} mb={5}>
          <GridItem>
            <Card bg={cardBg}>
              <CardHeader bg={headerBg} py={3} px={4}>
                <Text fontWeight="medium">总用户</Text>
              </CardHeader>
              <CardBody py={3} px={4}>
                <Text fontSize="2xl" fontWeight="bold">{mockUsers.length}</Text>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card bg={cardBg}>
              <CardHeader bg={headerBg} py={3} px={4}>
                <Text fontWeight="medium">活跃用户</Text>
              </CardHeader>
              <CardBody py={3} px={4}>
                <Text fontSize="2xl" fontWeight="bold">
                  {mockUsers.filter(user => user.status === 'active').length}
                </Text>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card bg={cardBg}>
              <CardHeader bg={headerBg} py={3} px={4}>
                <Text fontWeight="medium">管理员</Text>
              </CardHeader>
              <CardBody py={3} px={4}>
                <Text fontSize="2xl" fontWeight="bold">
                  {mockUsers.filter(user => user.role === 'Admin').length}
                </Text>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card bg={cardBg}>
              <CardHeader bg={headerBg} py={3} px={4}>
                <Text fontWeight="medium">待处理</Text>
              </CardHeader>
              <CardBody py={3} px={4}>
                <Text fontSize="2xl" fontWeight="bold">
                  {mockUsers.filter(user => user.status === 'pending').length}
                </Text>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
        
        <Table
          columns={columns}
          data={getCurrentPageData()}
          rowKey="id"
          loading={loading}
          pagination={{
            currentPage: pagination.currentPage,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePageChange,
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: handleRowSelectionChange,
          }}
          onRowClick={(record) => console.log('点击行:', record)}
          defaultSettings={{
            showBorders: true,
            density: 'comfortable',
            stripedRows: true,
            highlightOnHover: true,
          }}
        />
      </Box>
    </Page>
  );
};

export default TableDemo;
