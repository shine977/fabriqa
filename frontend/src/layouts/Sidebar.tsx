/**
 * Sidebar Component
 * 
 * 侧边栏菜单组件
 */

import React from 'react';
import { NavLink as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Icon,
  Tooltip,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  SettingsIcon,
  StarIcon,
  ViewIcon,
  CalendarIcon,
  InfoIcon,
  EditIcon,
  LockIcon,
  BellIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import { pluginSystem } from '../plugins';

// 菜单项定义
const menuItems = [
  {
    label: '仪表盘',
    icon: StarIcon,
    path: '/',
  },
  {
    label: '用户管理',
    icon: ViewIcon,
    submenu: [
      { label: '用户列表', path: '/users' },
      { label: '用户组', path: '/user-groups' },
      { label: '权限管理', path: '/permissions' },
    ],
  },
  {
    label: '内容管理',
    icon: EditIcon,
    submenu: [
      { label: '文章列表', path: '/articles' },
      { label: '分类管理', path: '/categories' },
      { label: '标签管理', path: '/tags' },
    ],
  },
  {
    label: '系统设置',
    icon: SettingsIcon,
    path: '/settings',
  },
  {
    label: '日志管理',
    icon: InfoIcon,
    path: '/logs',
  },
];

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  // 使用插件系统处理菜单项
  const enhancedMenuItems = pluginSystem.applyHooks('layout:menuItems', menuItems);
  
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  
  return (
    <Box>
      <VStack align="stretch" spacing={0}>
        {enhancedMenuItems.map((item, index) => (
          <Box key={index}>
            {item.submenu ? (
              // 有子菜单的项
              <Accordion allowToggle>
                <AccordionItem border="none">
                  <AccordionButton
                    py={3}
                    px={4}
                    _hover={{ bg: hoverBg }}
                    display={collapsed ? 'none' : 'flex'}
                  >
                    <HStack flex="1" spacing={3} align="center">
                      <Icon as={item.icon} boxSize={5} />
                      <Text>{item.label}</Text>
                    </HStack>
                    <AccordionIcon />
                  </AccordionButton>
                  
                  {/* 折叠时仅显示图标 */}
                  {collapsed && (
                    <Tooltip label={item.label} placement="right">
                      <Flex
                        py={3}
                        justifyContent="center"
                        _hover={{ bg: hoverBg }}
                        cursor="pointer"
                      >
                        <Icon as={item.icon} boxSize={5} />
                      </Flex>
                    </Tooltip>
                  )}
                  
                  <AccordionPanel pb={0} px={0} display={collapsed ? 'none' : 'block'}>
                    <VStack align="stretch" spacing={0} pl={6}>
                      {item.submenu.map((subItem, subIndex) => (
                        <Box
                          key={subIndex}
                          as={RouterLink}
                          to={subItem.path}
                          py={2}
                          px={4}
                          _hover={{ bg: hoverBg }}
                          _activeLink={{ bg: activeBg, color: activeColor }}
                        >
                          <Text fontSize="sm">{subItem.label}</Text>
                        </Box>
                      ))}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            ) : (
              // 无子菜单的项
              <>
                {/* 展开时显示图标和文字 */}
                {!collapsed && (
                  <Box
                    as={RouterLink}
                    to={item.path}
                    py={3}
                    px={4}
                    _hover={{ bg: hoverBg }}
                    _activeLink={{ bg: activeBg, color: activeColor }}
                  >
                    <HStack spacing={3}>
                      <Icon as={item.icon} boxSize={5} />
                      <Text>{item.label}</Text>
                    </HStack>
                  </Box>
                )}
                
                {/* 折叠时仅显示图标 */}
                {collapsed && (
                  <Tooltip label={item.label} placement="right">
                    <Box
                      as={RouterLink}
                      to={item.path}
                      py={3}
                      display="flex"
                      justifyContent="center"
                      _hover={{ bg: hoverBg }}
                      _activeLink={{ bg: activeBg, color: activeColor }}
                    >
                      <Icon as={item.icon} boxSize={5} />
                    </Box>
                  </Tooltip>
                )}
              </>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar;
