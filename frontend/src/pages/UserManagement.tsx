/**
 * User Management Page
 * 
 * 用户管理页面，展示用户列表并提供用户管理功能
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import Page from '../components/Page';
import Table from '../components/Table';
import Form from '../components/Form_bak';
import { TableColumn, FormField } from '../types';

// 模拟用户数据
const mockUsers = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员', status: '激活', lastLogin: '2023-04-15 08:30' },
  { id: 2, name: '李四', email: 'lisi@example.com', role: '编辑', status: '激活', lastLogin: '2023-04-14 13:45' },
  { id: 3, name: '王五', email: 'wangwu@example.com', role: '访客', status: '激活', lastLogin: '2023-04-10 09:15' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: '编辑', status: '停用', lastLogin: '2023-03-22 16:20' },
  { id: 5, name: '钱七', email: 'qianqi@example.com', role: '访客', status: '激活', lastLogin: '2023-04-13 11:05' },
];

// 表格列定义
const columns: TableColumn[] = [
  { 
    id: 'name', 
    header: '姓名', 
    accessor: 'name',
  },
  { 
    id: 'email', 
    header: '邮箱', 
    accessor: 'email',
  },
  { 
    id: 'role', 
    header: '角色', 
    accessor: 'role',
    cell: (value) => {
      const colorMap: Record<string, string> = {
        '管理员': 'blue',
        '编辑': 'green',
        '访客': 'gray'
      };
      return {
        value,
        badge: {
          colorScheme: colorMap[value as string] || 'gray',
        }
      };
    } 
  },
  { 
    id: 'status', 
    header: '状态', 
    accessor: 'status',
    cell: (value) => ({
      value,
      badge: {
        colorScheme: value === '激活' ? 'green' : 'red',
      }
    }) 
  },
  { 
    id: 'lastLogin', 
    header: '最后登录', 
    accessor: 'lastLogin' 
  },
];

// 表单字段定义
const formFields: FormField[] = [
  { 
    id: 'name', 
    label: '姓名', 
    type: 'text', 
    placeholder: '请输入姓名',
    required: true 
  },
  { 
    id: 'email', 
    label: '邮箱', 
    type: 'email', 
    placeholder: '请输入邮箱',
    required: true 
  },
  { 
    id: 'role', 
    label: '角色', 
    type: 'select', 
    options: [
      { value: '管理员', label: '管理员' },
      { value: '编辑', label: '编辑' },
      { value: '访客', label: '访客' },
    ],
    required: true 
  },
  { 
    id: 'status', 
    label: '状态', 
    type: 'select', 
    options: [
      { value: '激活', label: '激活' },
      { value: '停用', label: '停用' },
    ],
    required: true 
  },
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 处理表格操作
  const handleAction = (action: string, row: any) => {
    if (action === 'edit') {
      setSelectedUser(row);
      setIsEdit(true);
      onOpen();
    } else if (action === 'delete') {
      if (window.confirm('确定要删除此用户吗？')) {
        setUsers(users.filter(user => user.id !== row.id));
      }
    }
  };

  // 打开添加用户表单
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsEdit(false);
    onOpen();
  };

  // 处理表单提交
  const handleSubmit = (values: any) => {
    if (isEdit && selectedUser) {
      // 更新现有用户
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, ...values } : user
      ));
    } else {
      // 添加新用户
      const newUser = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...values,
        lastLogin: '-'
      };
      setUsers([...users, newUser]);
    }
    onClose();
  };

  // 表格操作按钮
  const actions = [
    { 
      icon: <FiEdit />, 
      label: '编辑', 
      onClick: (row: any) => handleAction('edit', row) 
    },
    { 
      icon: <FiTrash2 />, 
      label: '删除', 
      onClick: (row: any) => handleAction('delete', row),
      colorScheme: 'red'
    },
  ];

  return (
    <Page 
      title="用户管理"
      actions={[
        <Button 
          key="add-user" 
          leftIcon={<FiPlus />} 
          colorScheme="brand" 
          onClick={handleAddUser}
        >
          添加用户
        </Button>
      ]}
    >
      <Box bg="white" shadow="sm" borderRadius="md" overflow="hidden">
        <Table 
          columns={columns} 
          data={users} 
          actions={actions}
          pagination={{
            pageSize: 10,
            totalCount: users.length
          }}
        />
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEdit ? '编辑用户' : '添加用户'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Form 
              fields={formFields}
              initialValues={selectedUser || {}}
              onSubmit={handleSubmit}
              submitLabel={isEdit ? '更新' : '添加'}
              isModal={true}
            />
          </ModalBody>
          <ModalFooter>
            {/* 表单中已包含提交和取消按钮 */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Page>
  );
};

export default UserManagement;
