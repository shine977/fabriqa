/**
 * Sidebar Component
 * 
 * A modern, sleek sidebar navigation component with collapsible functionality.
 * Automatically generates menu items from route configuration to ensure consistency
 * between routes and navigation menu.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { NavLink as RouterLink, useLocation } from 'react-router-dom';
import {
  Icon,
  Tooltip,
  Box,
  Text,
  Flex,
} from '@chakra-ui/react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import { useRoutes } from '../routes/routes';
import { Route } from '../types';
import { getMenuRoutes } from '../utils/routes';

// Interface for menu items constructed from routes
interface MenuItem {
  label: string;
  icon: React.ReactNode | null;
  path: string;
  submenu?: {
    label: string;
    path: string;
    icon: React.ReactNode | null;
  }[];
}

/**
 * Builds menu items from route configuration
 * 
 * @param routes - The application routes
 * @returns Array of menu items with proper structure for rendering
 */
const buildMenuItems = (routes: Route[]): MenuItem[] => {
  // Get routes that have menu properties
  const menuRoutes = getMenuRoutes(routes);
  
  return menuRoutes.map(route => {
    // Create basic menu item
    const menuItem: MenuItem = {
      label: route.menu?.title || '',
      icon: route.menu?.icon || null,
      path: route.path,
    };
    
    // Handle submenu (children routes)
    if (route.menu?.children && route.menu.children.length > 0) {
      const childrenWithMenu = route.menu.children.filter(child => child.menu);
      
      if (childrenWithMenu.length > 0) {
        return {
          ...menuItem,
          submenu: childrenWithMenu.map(child => ({
            label: child.menu?.title || '',
            path: child.path,
            icon: child.menu?.icon || null,
          })),
        };
      }
    }
    
    return menuItem;
  });
};

// 预定义常用样式类，提高可维护性
const styles = {
  sidebarContainer: "flex flex-col h-[calc(100vh-4rem)] overflow-y-auto bg-white dark:bg-neutral-800",
  scrollbar: "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500",
  navHeader: "text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-4 ml-2",
  menuList: "space-y-1",
  menuItemBase: "flex items-center px-2 py-2.5 rounded-lg text-sm font-medium transition duration-200 ease-in-out",
  menuItemActive: "bg-primary-100 dark:bg-primary-500/40 text-primary-700 dark:text-white font-medium",
  menuItemInactive: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700/50",
  menuSubmenuHeader: "flex items-center justify-between w-full px-2 py-2.5 rounded-lg text-sm font-medium transition duration-200 ease-in-out",
  menuSubmenuHeaderActive: "bg-primary-100 dark:bg-primary-500/40 text-primary-700 dark:text-white font-medium",
  menuSubmenuHeaderInactive: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700/50",
  menuSubItem: "block px-2 py-1.5 rounded-lg text-sm font-medium transition duration-200 ease-in-out",
  menuSubItemActive: "bg-primary-100 dark:bg-primary-500/40 text-primary-700 dark:text-white font-medium",
  menuSubItemInactive: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700/50",
  iconWrapper: "flex items-center justify-center w-7 h-7",
  helpSection: "mt-auto p-4 border-t border-gray-200 dark:border-neutral-700",
  helpBox: "bg-primary-100 dark:bg-primary-500/40 rounded-xl p-4",
  helpTitle: "text-sm font-medium text-primary-700 dark:text-white mb-2",
  helpText: "text-xs text-gray-600 dark:text-gray-400 mb-3",
  helpButton: "inline-flex items-center justify-center w-full px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all duration-200"
};

interface SidebarProps {
  collapsed: boolean;
  onCollapse?: () => void;
}

/**
 * Sidebar component that renders navigation menu
 * Based on application routes and supports collapsible state
 */
const Sidebar: React.FC<SidebarProps> = ({ collapsed, onCollapse }) => {
  const location = useLocation();
  
  // 获取路由配置
  const routes = useRoutes();
  
  // Build menu items from routes configuration (memoized to prevent unnecessary recalculations)
  const menuItems = useMemo(() => buildMenuItems(routes), [routes]);
  
  // Track open submenus
  const [openSubmenus, setOpenSubmenus] = useState<Record<number, boolean>>({});
  
  // Function to check if any submenu item path matches current location
  const isActiveSubmenu = useMemo(() => {
    return (submenuItems: { path: string }[]) => {
      return submenuItems.some(item => location.pathname === item.path);
    };
  }, [location.pathname]);
  
  // Auto-expand submenus based on current route
  useEffect(() => {
    const newOpenSubmenus: Record<number, boolean> = {};
    
    menuItems.forEach((item, index) => {
      if (item.submenu && isActiveSubmenu(item.submenu)) {
        newOpenSubmenus[index] = true;
      }
    });
    
    setOpenSubmenus(prev => ({
      ...prev,
      ...newOpenSubmenus
    }));
  }, [location.pathname, isActiveSubmenu]); // 只依赖路径变化和记忆化的函数
  
  /**
   * Toggle submenu open/closed state
   */
  const toggleSubmenu = (index: number) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  /**
   * Check if the given path matches current location
   */
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className={`${styles.sidebarContainer} ${styles.scrollbar} h-full`}>
      <div className="pt-4 pb-2 px-3">
        {!collapsed && (
          <div className={styles.navHeader}>
            主导航
          </div>
        )}
        
        <ul className={styles.menuList}>
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.submenu ? (
                // Menu item with submenu
                <div>
                  <button
                    onClick={() => toggleSubmenu(index)}
                    className={`
                      ${styles.menuSubmenuHeader} 
                      ${isActiveSubmenu(item.submenu) ? styles.menuSubmenuHeaderActive : styles.menuSubmenuHeaderInactive}
                      ${collapsed ? 'justify-center' : 'justify-between'}
                    `}
                  >
                    <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                      <div className={styles.iconWrapper}>
                        {item.icon}
                      </div>
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    
                    {!collapsed && (
                      <div className="text-gray-500 dark:text-gray-400">
                        {openSubmenus[index] ? (
                          <ChevronDownIcon boxSize={4} />
                        ) : (
                          <ChevronRightIcon boxSize={4} />
                        )}
                      </div>
                    )}
                  </button>
                  
                  {collapsed ? (
                    <Tooltip label={item.label} placement="right">
                      <span></span>
                    </Tooltip>
                  ) : (
                    <div
                      className={`overflow-hidden transition-all duration-300`}
                      style={{ 
                        maxHeight: openSubmenus[index] || isActiveSubmenu(item.submenu) ? '60rem' : '0'
                      }}
                    >
                      <ul className="mt-1 pl-10 space-y-1">
                        {item.submenu.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <RouterLink
                              to={subItem.path}
                              className={({ isActive }) => `
                                ${styles.menuSubItem}
                                ${isActive ? styles.menuSubItemActive : styles.menuSubItemInactive}
                              `}
                            >
                              <div className="flex items-center gap-2">
                                {subItem.icon && <span>{subItem.icon}</span>}
                                <span>{subItem.label}</span>
                              </div>
                            </RouterLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                // Simple menu item (no submenu)
                <>
                  {collapsed ? (
                    <Tooltip label={item.label} placement="right">
                      <div>
                        <RouterLink
                          to={item.path}
                          className={({ isActive }) => `
                            ${styles.menuItemBase} justify-center
                            ${isActive ? styles.menuItemActive : styles.menuItemInactive}
                          `}
                        >
                          <div className={styles.iconWrapper}>
                            {item.icon}
                          </div>
                        </RouterLink>
                      </div>
                    </Tooltip>
                  ) : (
                    <RouterLink
                      to={item.path}
                      className={({ isActive }) => `
                        ${styles.menuItemBase} gap-3
                        ${isActive ? styles.menuItemActive : styles.menuItemInactive}
                      `}
                    >
                      <div className={styles.iconWrapper}>
                        {item.icon}
                      </div>
                      <span>{item.label}</span>
                    </RouterLink>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Help section at the bottom */}
      {!collapsed && (
        <div className={styles.helpSection}>
          <div className={styles.helpBox}>
            <div className={styles.helpTitle}>
              需要帮助?
            </div>
            <div className={styles.helpText}>
              查看我们的文档获取支持和帮助
            </div>
            <a
              href="#"
              className={styles.helpButton}
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
