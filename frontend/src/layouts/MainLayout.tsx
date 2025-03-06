/**
 * MainLayout Component
 * 
 * 主要布局组件，包括顶部导航栏、侧边菜单和内容区域
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Flex,
  IconButton,
  useColorModeValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Heading,
  Text,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { HamburgerIcon, ChevronRightIcon } from '@chakra-ui/icons';
import Sidebar from './Sidebar';
import { pluginSystem } from '../plugins';

interface MainLayoutProps {
  breadcrumbs?: { label: string; path: string }[];
}

const MainLayout: React.FC<MainLayoutProps> = ({ breadcrumbs = [] }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [collapsed, setCollapsed] = useState(false);

  // 使用插件系统处理面包屑
  const enhancedBreadcrumbs = pluginSystem.applyHooks('layout:breadcrumbs', breadcrumbs);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex h="100vh" flexDirection="column">
      {/* 顶部导航栏 */}
      <Flex
        as="header"
        align="center"
        justify="space-between"
        py={2}
        px={4}
        bg={bgColor}
        borderBottomWidth="1px"
        borderColor={borderColor}
        boxShadow="sm"
      >
        <HStack spacing={3}>
          <IconButton
            aria-label="菜单"
            icon={<HamburgerIcon />}
            variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            display={{ base: 'none', md: 'flex' }}
          />
          <IconButton
            aria-label="移动端菜单"
            icon={<HamburgerIcon />}
            variant="ghost"
            onClick={onOpen}
            display={{ base: 'flex', md: 'none' }}
          />
          <Heading size="md" cursor="pointer">
            Admin Dashboard
          </Heading>
        </HStack>

        <HStack spacing={3}>
          <Badge colorScheme="green" variant="subtle" p={1} borderRadius="full">
            v1.0.0
          </Badge>
          <Menu>
            <MenuButton>
              <Avatar size="sm" name="User" src="" />
            </MenuButton>
            <MenuList>
              <MenuItem>个人资料</MenuItem>
              <MenuItem>设置</MenuItem>
              <MenuDivider />
              <MenuItem>退出登录</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      <Flex flex="1" overflow="hidden">
        {/* 侧边菜单 - 桌面版 */}
        <Box
          as="aside"
          w={collapsed ? '60px' : '240px'}
          bg={bgColor}
          borderRightWidth="1px"
          borderColor={borderColor}
          transition="width 0.3s"
          display={{ base: 'none', md: 'block' }}
        >
          <Sidebar collapsed={collapsed} />
        </Box>

        {/* 侧边菜单 - 移动版 */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">菜单</DrawerHeader>
            <DrawerBody p={0}>
              <Sidebar collapsed={false} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* 主要内容区域 */}
        <Box
          flex="1"
          p={4}
          bg={useColorModeValue('gray.50', 'gray.900')}
          overflowY="auto"
        >
          {/* 面包屑导航 */}
          {enhancedBreadcrumbs.length > 0 && (
            <Breadcrumb
              mb={4}
              separator={<ChevronRightIcon color="gray.500" />}
              fontSize="sm"
            >
              <BreadcrumbItem>
                <BreadcrumbLink href="/">首页</BreadcrumbLink>
              </BreadcrumbItem>

              {enhancedBreadcrumbs.map((crumb, index) => (
                <BreadcrumbItem
                  key={index}
                  isCurrentPage={index === enhancedBreadcrumbs.length - 1}
                >
                  <BreadcrumbLink href={crumb.path}>
                    {crumb.label}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          )}

          {/* 内容区域 */}
          <Box bg={bgColor} borderRadius="md" boxShadow="sm">
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default MainLayout;
