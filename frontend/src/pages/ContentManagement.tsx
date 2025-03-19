/**
 * Content Management Page
 * 
 * 内容管理页面，展示内容列表并提供内容管理功能
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Flex,
  Tag,
  HStack,
  Text,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiEye, FiTrash2 } from 'react-icons/fi';
import Page from '../components/Page';
import Table from '../components/Table';
import Form from '../components/Form_bak';
import { TableColumn, FormField } from '../types';

// 模拟内容数据
const mockArticles = [
  { id: 1, title: '系统使用指南', category: '文档', status: '已发布', author: '张三', publishDate: '2023-04-10', views: 325 },
  { id: 2, title: '产品更新公告', category: '公告', status: '已发布', author: '李四', publishDate: '2023-04-05', views: 612 },
  { id: 3, title: '市场分析报告', category: '报告', status: '草稿', author: '王五', publishDate: '-', views: 0 },
  { id: 4, title: '用户反馈总结', category: '报告', status: '审核中', author: '赵六', publishDate: '-', views: 0 },
  { id: 5, title: '新功能介绍', category: '文档', status: '已发布', author: '张三', publishDate: '2023-03-28', views: 189 },
];

const mockMedia = [
  { id: 1, name: '产品宣传图', type: '图片', size: '2.3MB', uploadDate: '2023-04-12', uploader: '张三' },
  { id: 2, name: '操作教程', type: '视频', size: '45.7MB', uploadDate: '2023-04-08', uploader: '李四' },
  { id: 3, name: '用户调研数据', type: '文档', size: '1.2MB', uploadDate: '2023-04-02', uploader: '王五' },
  { id: 4, name: '系统图标集', type: '压缩包', size: '8.5MB', uploadDate: '2023-03-25', uploader: '赵六' },
];

// 文章表格列定义
const articleColumns: TableColumn[] = [
  { 
    id: 'title', 
    header: '标题', 
    accessor: 'title',
    minWidth: '250px',
  },
  { 
    id: 'category', 
    header: '分类', 
    accessor: 'category',
    cell: (value) => {
      const colorMap: Record<string, string> = {
        '文档': 'blue',
        '公告': 'purple',
        '报告': 'orange'
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
    cell: (value) => {
      const colorMap: Record<string, string> = {
        '已发布': 'green',
        '草稿': 'gray',
        '审核中': 'yellow'
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
    id: 'author', 
    header: '作者', 
    accessor: 'author' 
  },
  { 
    id: 'publishDate', 
    header: '发布日期', 
    accessor: 'publishDate' 
  },
  { 
    id: 'views', 
    header: '浏览量', 
    accessor: 'views' 
  },
];

// 媒体表格列定义
const mediaColumns: TableColumn[] = [
  { 
    id: 'name', 
    header: '名称', 
    accessor: 'name',
    minWidth: '250px',
  },
  { 
    id: 'type', 
    header: '类型', 
    accessor: 'type',
    cell: (value) => {
      const colorMap: Record<string, string> = {
        '图片': 'blue',
        '视频': 'red',
        '文档': 'green',
        '压缩包': 'orange'
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
    id: 'size', 
    header: '大小', 
    accessor: 'size' 
  },
  { 
    id: 'uploadDate', 
    header: '上传日期', 
    accessor: 'uploadDate' 
  },
  { 
    id: 'uploader', 
    header: '上传者', 
    accessor: 'uploader' 
  },
];

// 文章表单字段定义
const articleFormFields: FormField[] = [
  { 
    id: 'title', 
    label: '标题', 
    type: 'text', 
    placeholder: '请输入标题',
    required: true 
  },
  { 
    id: 'category', 
    label: '分类', 
    type: 'select', 
    options: [
      { value: '文档', label: '文档' },
      { value: '公告', label: '公告' },
      { value: '报告', label: '报告' },
    ],
    required: true 
  },
  { 
    id: 'status', 
    label: '状态', 
    type: 'select', 
    options: [
      { value: '已发布', label: '已发布' },
      { value: '草稿', label: '草稿' },
      { value: '审核中', label: '审核中' },
    ],
    required: true 
  },
  { 
    id: 'content', 
    label: '内容', 
    type: 'textarea', 
    placeholder: '请输入内容',
    required: true,
    rows: 10
  },
];

// 媒体表单字段定义
const mediaFormFields: FormField[] = [
  { 
    id: 'name', 
    label: '名称', 
    type: 'text', 
    placeholder: '请输入名称',
    required: true 
  },
  { 
    id: 'type', 
    label: '类型', 
    type: 'select', 
    options: [
      { value: '图片', label: '图片' },
      { value: '视频', label: '视频' },
      { value: '文档', label: '文档' },
      { value: '压缩包', label: '压缩包' },
    ],
    required: true 
  },
  { 
    id: 'file', 
    label: '文件', 
    type: 'file', 
    required: true 
  },
];

const ContentManagement: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [articles, setArticles] = useState(mockArticles);
  const [media, setMedia] = useState(mockMedia);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 处理表格操作
  const handleAction = (action: string, row: any, type: 'article' | 'media') => {
    if (action === 'edit') {
      setSelectedItem(row);
      setIsEdit(true);
      onOpen();
    } else if (action === 'delete') {
      if (window.confirm(`确定要删除此${type === 'article' ? '文章' : '媒体'}吗？`)) {
        if (type === 'article') {
          setArticles(articles.filter(item => item.id !== row.id));
        } else {
          setMedia(media.filter(item => item.id !== row.id));
        }
      }
    } else if (action === 'view' && type === 'article') {
      // 在实际应用中，这里可能会跳转到文章详情页
      alert(`查看文章: ${row.title}`);
    }
  };

  // 打开添加表单
  const handleAdd = () => {
    setSelectedItem(null);
    setIsEdit(false);
    onOpen();
  };

  // 处理表单提交
  const handleSubmit = (values: any) => {
    if (tabIndex === 0) { // 文章
      if (isEdit && selectedItem) {
        // 更新现有文章
        setArticles(articles.map(article => 
          article.id === selectedItem.id ? { ...article, ...values } : article
        ));
      } else {
        // 添加新文章
        const newArticle = {
          id: Math.max(...articles.map(a => a.id)) + 1,
          ...values,
          author: '当前用户', // 在实际应用中，这会是当前登录用户
          publishDate: values.status === '已发布' ? new Date().toISOString().split('T')[0] : '-',
          views: 0
        };
        setArticles([...articles, newArticle]);
      }
    } else { // 媒体
      if (isEdit && selectedItem) {
        // 更新现有媒体
        setMedia(media.map(item => 
          item.id === selectedItem.id ? { ...item, ...values } : item
        ));
      } else {
        // 添加新媒体
        const newMedia = {
          id: Math.max(...media.map(m => m.id)) + 1,
          ...values,
          uploader: '当前用户', // 在实际应用中，这会是当前登录用户
          uploadDate: new Date().toISOString().split('T')[0],
          size: '0MB' // 在实际应用中，这会是真实文件大小
        };
        setMedia([...media, newMedia]);
      }
    }
    onClose();
  };

  // 文章表格操作按钮
  const articleActions = [
    { 
      icon: <FiEye />, 
      label: '查看', 
      onClick: (row: any) => handleAction('view', row, 'article') 
    },
    { 
      icon: <FiEdit />, 
      label: '编辑', 
      onClick: (row: any) => handleAction('edit', row, 'article') 
    },
    { 
      icon: <FiTrash2 />, 
      label: '删除', 
      onClick: (row: any) => handleAction('delete', row, 'article'),
      colorScheme: 'red'
    },
  ];

  // 媒体表格操作按钮
  const mediaActions = [
    { 
      icon: <FiEdit />, 
      label: '编辑', 
      onClick: (row: any) => handleAction('edit', row, 'media') 
    },
    { 
      icon: <FiTrash2 />, 
      label: '删除', 
      onClick: (row: any) => handleAction('delete', row, 'media'),
      colorScheme: 'red'
    },
  ];

  return (
    <Page 
      title="内容管理"
      actions={[
        <Button 
          key="add-content" 
          leftIcon={<FiPlus />} 
          colorScheme="brand" 
          onClick={handleAdd}
        >
          添加{tabIndex === 0 ? '文章' : '媒体'}
        </Button>
      ]}
    >
      <Tabs isLazy onChange={(index) => setTabIndex(index)} colorScheme="brand">
        <TabList>
          <Tab>文章管理</Tab>
          <Tab>媒体管理</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Box bg="white" shadow="sm" borderRadius="md" overflow="hidden">
              <Table 
                columns={articleColumns} 
                data={articles} 
                actions={articleActions}
                pagination={{
                  pageSize: 10,
                  totalCount: articles.length
                }}
              />
            </Box>
          </TabPanel>
          
          <TabPanel px={0}>
            <Box bg="white" shadow="sm" borderRadius="md" overflow="hidden">
              <Table 
                columns={mediaColumns} 
                data={media} 
                actions={mediaActions}
                pagination={{
                  pageSize: 10,
                  totalCount: media.length
                }}
              />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEdit ? `编辑${tabIndex === 0 ? '文章' : '媒体'}` : `添加${tabIndex === 0 ? '文章' : '媒体'}`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Form 
              fields={tabIndex === 0 ? articleFormFields : mediaFormFields}
              initialValues={selectedItem || {}}
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

export default ContentManagement;
