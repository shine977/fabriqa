/**
 * MainLayout Component
 * 
 * 主要布局组件，包括顶部导航栏、侧边菜单和内容区域
 * 采用现代科技风格设计，注重用户体验和视觉美感
 */

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
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
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  RadioGroup,
  Radio,
  Stack,
  Button,
  useToast,
} from '@chakra-ui/react';
import { 
  HamburgerIcon, 
  ChevronRightIcon, 
  SearchIcon, 
  BellIcon, 
  MoonIcon, 
  SunIcon, 
  SettingsIcon,
  ChevronDownIcon
} from '@chakra-ui/icons';
import { FiGlobe, FiMonitor, FiLogOut } from 'react-icons/fi';
import Sidebar from './Sidebar';
import { appPlugin } from '../plugins';
import { ThemeMode } from '../plugins/themePlugin';
import { useTranslation, useLanguage, Language, languageOptions } from '../plugins/i18nPlugin';
import { useAuth } from '../hooks/useAuth';

interface MainLayoutProps {
  breadcrumbs?: { label: string; path: string }[];
}

const MainLayout: React.FC<MainLayoutProps> = ({ breadcrumbs = [] }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // 获取翻译实例
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  // 获取认证信息
  const { user } = useAuth();

  // 获取主题控制器
  const themeController = appPlugin.applyHooks('theme:get', null);
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    appPlugin.applyHooks('theme:getCurrentTheme', 'system')
  );
  
  // 监听主题变化
  useEffect(() => {
    // const unsubscribe = appPlugin.applyHooks('theme:changed', (mode: ThemeMode) => {
    //   setThemeMode(mode);
    // });
    // return unsubscribe;
  }, []);

  // 使用插件系统处理面包屑
  const enhancedBreadcrumbs = appPlugin.applyHooks('layout:breadcrumbs', breadcrumbs);

  // 切换主题的处理函数
  const handleThemeChange = (value: ThemeMode) => {
    appPlugin.applyHooks('theme:set', value, value);
  };

  // 切换语言的处理函数
  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
  };

  // 处理用户登出
  const handleLogout = () => {
    // authService.logout();
    
    toast({
      title: t('user.logoutSuccess'),
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });
    
    // 重定向到登录页面
    navigate('/login');
  };

  // 根据当前主题获取背景颜色
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  
  // 获取当前可用的语言选项
  const availableLanguages = appPlugin.applyHooks('language:getOptions', languageOptions);

  return (
    <Box minH="100vh" className="dark:bg-neutral-900 bg-white">
      {/* 顶部导航栏 */}
      <Flex
        as="header"
        position="fixed"
        w="full"
        px={4}
        py={2}
        h="16"
        alignItems="center"
        bg={bgColor}
        borderBottomWidth="1px"
        borderBottomColor={borderColor}
        justifyContent="space-between"
        zIndex="sticky"
        className="dark:bg-neutral-800 dark:border-neutral-700 bg-white border-gray-200 shadow-nav"
      >
        {/* 左侧菜单和Logo */}
        <Flex alignItems="center">
          <IconButton
            aria-label={t('sidebar.toggle')}
            icon={<HamburgerIcon />}
            size="md"
            variant="ghost"
            onClick={onOpen}
            display={{ base: 'flex', md: 'none' }}
            className="dark:text-white text-gray-800 hover:bg-neutral-700"
          />
          
          <Link to="/">
            <Flex alignItems="center" ml={{ base: 2, md: 0 }}>
              <Box 
                bg="primary.500" 
                p={1} 
                borderRadius="md" 
                mr={2}
                className="bg-primary-600 dark:bg-primary-500"
              >
                <Text 
                  fontSize="xl" 
                  fontWeight="bold" 
                  color="white"
                  className="text-white"
                >
                  F
                </Text>
              </Box>
              <Heading 
                size="md" 
                display={{ base: 'none', md: 'block' }}
                className="dark:text-white text-gray-800"
              >
                {t('appName')}
              </Heading>
            </Flex>
          </Link>
        </Flex>

        {/* 右侧功能区 */}
        <HStack spacing={3}>
          {/* 搜索按钮 */}
          <Tooltip label={t('action.search')} hasArrow>
            <IconButton
              aria-label={t('action.search')}
              icon={<SearchIcon />}
              variant="ghost"
              size="md"
              className="dark:text-white text-gray-800 hover:bg-neutral-700"
            />
          </Tooltip>
          
          {/* 主题切换按钮 */}
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <IconButton
                aria-label={t('theme.title')}
                icon={themeMode === 'dark' ? <MoonIcon /> : themeMode === 'light' ? <SunIcon /> : <FiMonitor />}
                variant="ghost"
                className="dark:text-white text-gray-800 hover:bg-neutral-700"
              />
            </PopoverTrigger>
            <PopoverContent className="dark:bg-neutral-800 dark:border-neutral-700">
              <PopoverArrow className="dark:bg-neutral-800 dark:border-neutral-700" />
              <PopoverCloseButton className="dark:text-white" />
              <PopoverHeader className="dark:text-white dark:border-neutral-700">{t('theme.title')}</PopoverHeader>
              <PopoverBody>
                <RadioGroup onChange={handleThemeChange as any} value={themeMode}>
                  <Stack>
                    <Radio value="light" className="dark:text-white">
                      <Flex align="center">
                        <SunIcon mr={2} />
                        {t('theme.light')}
                      </Flex>
                    </Radio>
                    <Radio value="dark" className="dark:text-white">
                      <Flex align="center">
                        <MoonIcon mr={2} />
                        {t('theme.dark')}
                      </Flex>
                    </Radio>
                    <Radio value="system" className="dark:text-white">
                      <Flex align="center">
                        <Box as={FiMonitor} mr={2} />
                        {t('theme.system')}
                      </Flex>
                    </Radio>
                  </Stack>
                </RadioGroup>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          
          {/* 语言切换菜单 */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
              leftIcon={<FiGlobe />}
              className="dark:text-white text-gray-800 hover:bg-neutral-700"
            >
              {language === 'zh-CN' ? '中文' : 'English'}
            </MenuButton>
            <MenuList className="dark:bg-neutral-800 dark:border-neutral-700">
              {availableLanguages.map((lang) => (
                <MenuItem 
                  key={lang.value} 
                  onClick={() => handleLanguageChange(lang.value as Language)}
                  className={`dark:text-white dark:hover:bg-neutral-700 ${language === lang.value ? 'dark:bg-neutral-700 bg-gray-100' : ''}`}
                >
                  <Box as="span" mr={2}>{lang.flag}</Box>
                  {lang.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          
          {/* 通知菜单 */}
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Notifications"
              icon={
                <Box position="relative">
                  <BellIcon />
                  <Badge
                    position="absolute"
                    top="-2px"
                    right="-2px"
                    fontSize="xs"
                    colorScheme="red"
                    borderRadius="full"
                  >
                    3
                  </Badge>
                </Box>
              }
              variant="ghost"
              className="dark:text-white text-gray-800 hover:bg-neutral-700"
            />
            <MenuList className="dark:bg-neutral-800 dark:border-neutral-700">
              <MenuItem className="dark:text-white dark:hover:bg-neutral-700">New message from Admin</MenuItem>
              <MenuItem className="dark:text-white dark:hover:bg-neutral-700">Server updates available</MenuItem>
              <MenuItem className="dark:text-white dark:hover:bg-neutral-700">System notification</MenuItem>
            </MenuList>
          </Menu>
          
          {/* 用户菜单 */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
              className="dark:text-white text-gray-800 hover:bg-neutral-700"
            >
              <Flex align="center">
                <Avatar
                  size="sm"
                  src={user?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80"}
                  mr={2}
                />
                <Box display={{ base: 'none', md: 'block' }}>
                  <Text fontWeight="medium">{user?.name || 'Admin User'}</Text>
                </Box>
              </Flex>
            </MenuButton>
            <MenuList className="dark:bg-neutral-800 dark:border-neutral-700">
              <MenuItem className="dark:text-white dark:hover:bg-neutral-700">
                <Flex align="center">
                  <Box className="w-5 mr-2" />
                  {t('user.profile')}
                </Flex>
              </MenuItem>
              <MenuItem className="dark:text-white dark:hover:bg-neutral-700">
                <Flex align="center">
                  <Box as={SettingsIcon} className="mr-2" />
                  {t('user.settings')}
                </Flex>
              </MenuItem>
              <MenuDivider className="dark:border-neutral-700" />
              <MenuItem 
                className="dark:text-white dark:hover:bg-neutral-700 text-red-500 dark:text-red-400"
                onClick={handleLogout}
              >
                <Flex align="center">
                  <Box as={FiLogOut} className="mr-2" />
                  {t('user.logout')}
                </Flex>
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* 手机端侧边栏抽屉 */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent className="dark:bg-neutral-800 dark:text-white">
          <DrawerCloseButton className="dark:text-white" />
          <DrawerHeader className="dark:border-neutral-700">{t('appName')}</DrawerHeader>
          <DrawerBody p={0}>
            <Sidebar collapsed={false} onCollapse={() => { }} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* 主内容区 */}
      <Flex>
        {/* 桌面端侧边栏 */}
        <Box
          display={{ base: 'none', md: 'block' }}
          w={collapsed ? "60px" : "240px"}
          pt="16"
          className="dark:bg-neutral-800 bg-white border-r dark:border-neutral-700 border-gray-200 transition-width duration-300"
        >
          <Sidebar collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} />
        </Box>

        {/* 主内容 */}
        <Box
          flex="1"
          pt="16"
          overflowY="auto"
          className="dark:bg-neutral-900 bg-gray-50"
        >
          {/* 面包屑导航 */}
          {enhancedBreadcrumbs.length > 0 && (
            <Box p={4} pb={0}>
              <Breadcrumb separator={<ChevronRightIcon color="gray.500" />}>
                <BreadcrumbItem>
                  <BreadcrumbLink as={Link} to="/" className="dark:text-white text-gray-800">
                    {t('navigation.dashboard')}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {enhancedBreadcrumbs.map((breadcrumb, index) => (
                  <BreadcrumbItem key={index} isCurrentPage={index === enhancedBreadcrumbs.length - 1}>
                    <BreadcrumbLink
                      as={Link}
                      to={breadcrumb.path}
                      className={index === enhancedBreadcrumbs.length - 1 ? 'dark:text-gray-300 text-gray-500' : 'dark:text-white text-gray-800'}
                    >
                      {breadcrumb.label}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                ))}
              </Breadcrumb>
            </Box>
          )}
          
          {/* 路由内容 */}
          <Box p={4} className="h-[calc(100vh-64px)] overflow-auto">
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default MainLayout;
