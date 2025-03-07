/**
 * Sidebar Component
 * 
 * 侧边栏菜单组件
 * 采用现代科技感十足的设计，支持折叠展开功能
 */

import React, { useState } from 'react';
import { NavLink as RouterLink, useLocation } from 'react-router-dom';
import {
  Icon,
  Tooltip,
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
  ChevronRightIcon,
  ChevronDownIcon,
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
  const location = useLocation();
  
  // 跟踪打开的子菜单
  const [openSubmenus, setOpenSubmenus] = useState<Record<number, boolean>>({});
  
  const toggleSubmenu = (index: number) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };
  
  const isActiveSubmenu = (submenuItems: { path: string }[]) => {
    return submenuItems.some(item => location.pathname === item.path);
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="pt-4 pb-2 px-3">
        {!collapsed && (
          <div className="text-xs font-medium uppercase text-neutral-500 dark:text-neutral-400 mb-4 ml-2">
            主导航
          </div>
        )}
        
        <ul className="space-y-1">
          {enhancedMenuItems.map((item, index) => (
            <li key={index}>
              {item.submenu ? (
                // 有子菜单的项
                <div>
                  <button
                    onClick={() => toggleSubmenu(index)}
                    className={`w-full flex items-center ${
                      collapsed ? 'justify-center' : 'justify-between'
                    } px-2 py-2.5 rounded-lg text-sm font-medium transition duration-200 ease-in-out ${
                      isActiveSubmenu(item.submenu)
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
                    }`}
                  >
                    <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                      <span className="flex items-center justify-center w-7 h-7">
                        <Icon as={item.icon} boxSize={5} />
                      </span>
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    
                    {!collapsed && (
                      <span className="text-neutral-500">
                        {openSubmenus[index] ? (
                          <ChevronDownIcon boxSize={4} />
                        ) : (
                          <ChevronRightIcon boxSize={4} />
                        )}
                      </span>
                    )}
                  </button>
                  
                  {collapsed ? (
                    <Tooltip label={item.label} placement="right">
                      <span></span>
                    </Tooltip>
                  ) : (
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openSubmenus[index] || isActiveSubmenu(item.submenu)
                          ? 'max-h-60'
                          : 'max-h-0'
                      }`}
                    >
                      <ul className="mt-1 pl-10 space-y-1">
                        {item.submenu.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <RouterLink
                              to={subItem.path}
                              className={({ isActive }) => `
                                block px-2 py-1.5 rounded-lg text-sm font-medium transition duration-200 ease-in-out
                                ${
                                  isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
                                }
                              `}
                            >
                              {subItem.label}
                            </RouterLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                // 无子菜单的项
                <>
                  {collapsed ? (
                    <Tooltip label={item.label} placement="right">
                      <RouterLink
                        to={item.path}
                        className={({ isActive }) => `
                          flex items-center justify-center px-2 py-2.5 rounded-lg text-sm font-medium transition duration-200 ease-in-out
                          ${
                            isActive
                              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
                          }
                        `}
                      >
                        <span className="flex items-center justify-center w-7 h-7">
                          <Icon as={item.icon} boxSize={5} />
                        </span>
                      </RouterLink>
                    </Tooltip>
                  ) : (
                    <RouterLink
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition duration-200 ease-in-out
                        ${
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
                        }
                      `}
                    >
                      <span className="flex items-center justify-center w-7 h-7">
                        <Icon as={item.icon} boxSize={5} />
                      </span>
                      <span>{item.label}</span>
                    </RouterLink>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      {!collapsed && (
        <div className="mt-auto p-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-4">
            <div className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-2">
              需要帮助?
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
              查看我们的文档获取支持和帮助
            </div>
            <a 
              href="#" 
              className="inline-flex items-center justify-center w-full px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition duration-200 ease-in-out"
            >
              查看文档
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
