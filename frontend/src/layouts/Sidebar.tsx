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
  useColorModeValue,
} from '@chakra-ui/react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import routes from '../routes/routes';
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

interface SidebarProps {
  collapsed: boolean;
}

/**
 * Sidebar component that renders navigation menu
 * Based on application routes and supports collapsible state
 */
const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const location = useLocation();
  
  // Color mode values for consistent theming
  const navBgActive = useColorModeValue('primary.50', 'rgba(66, 153, 225, 0.16)');
  const navTextActive = useColorModeValue('primary.600', 'primary.200');
  const navBgHover = useColorModeValue('gray.100', 'whiteAlpha.200');
  const navText = useColorModeValue('gray.700', 'whiteAlpha.900');
  const navTextSubtle = useColorModeValue('gray.600', 'whiteAlpha.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const helpBg = useColorModeValue('primary.50', 'rgba(66, 153, 225, 0.16)');
  const helpText = useColorModeValue('primary.600', 'primary.200');
  const helpTextSecondary = useColorModeValue('gray.600', 'whiteAlpha.700');
  
  // Build menu items from routes configuration (memoized to prevent unnecessary recalculations)
  const menuItems = useMemo(() => buildMenuItems(routes), []);
  
  // Track open submenus
  const [openSubmenus, setOpenSubmenus] = useState<Record<number, boolean>>({});
  
  // Function to check if any submenu item path matches current location
  const isActiveSubmenu = (submenuItems: { path: string }[]) => {
    return submenuItems.some(item => location.pathname === item.path);
  };
  
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
  }, [location.pathname]); // Remove menuItems dependency since it's now memoized
  
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
    <Flex 
      direction="column" 
      h="calc(100vh - 4rem)" 
      overflowY="auto"
      className="sidebar-scrollbar"
      bg={useColorModeValue('white', 'gray.800')}
      css={{
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: useColorModeValue('var(--chakra-colors-gray-300)', 'var(--chakra-colors-gray-600)') },
        '&::-webkit-scrollbar-thumb:hover': { background: useColorModeValue('var(--chakra-colors-gray-400)', 'var(--chakra-colors-gray-500)') },
      }}
    >
      <Box pt={4} pb={2} px={3}>
        {!collapsed && (
          <Text 
            fontSize="xs"
            fontWeight="medium"
            textTransform="uppercase"
            color={useColorModeValue('gray.500', 'gray.400')}
            mb={4}
            ml={2}
          >
            主导航
          </Text>
        )}
        
        <Box as="ul" className="space-y-1">
          {menuItems.map((item, index) => (
            <Box as="li" key={index}>
              {item.submenu ? (
                // Menu item with submenu
                <Box>
                  <Box
                    as="button"
                    onClick={() => toggleSubmenu(index)}
                    w="full"
                    display="flex"
                    alignItems="center"
                    justifyContent={collapsed ? "center" : "space-between"}
                    px={2}
                    py={2.5}
                    borderRadius="lg"
                    fontSize="sm"
                    fontWeight="medium"
                    transition="all 0.2s ease-in-out"
                    bg={isActiveSubmenu(item.submenu) ? navBgActive : 'transparent'}
                    color={isActiveSubmenu(item.submenu) ? navTextActive : navText}
                    _hover={{
                      bg: navBgHover,
                    }}
                  >
                    <Flex alignItems="center" gap={collapsed ? 0 : 3}>
                      <Flex 
                        alignItems="center" 
                        justifyContent="center" 
                        w={7} 
                        h={7}
                      >
                        {item.icon}
                      </Flex>
                      {!collapsed && <span>{item.label}</span>}
                    </Flex>
                    
                    {!collapsed && (
                      <Box color={navTextSubtle}>
                        {openSubmenus[index] ? (
                          <ChevronDownIcon boxSize={4} />
                        ) : (
                          <ChevronRightIcon boxSize={4} />
                        )}
                      </Box>
                    )}
                  </Box>
                  
                  {collapsed ? (
                    <Tooltip label={item.label} placement="right">
                      <span></span>
                    </Tooltip>
                  ) : (
                    <Box
                      overflow="hidden"
                      transition="all 0.3s"
                      maxH={openSubmenus[index] || isActiveSubmenu(item.submenu) ? "60rem" : "0"}
                    >
                      <Box as="ul" mt={1} pl={10} className="space-y-1">
                        {item.submenu.map((subItem, subIndex) => (
                          <Box as="li" key={subIndex}>
                            <RouterLink
                              to={subItem.path}
                              className={({ isActive }) => `
                                block px-2 py-1.5 rounded-lg text-sm font-medium transition duration-200 ease-in-out
                                ${
                                  isActive
                                    ? `bg-${navBgActive.split('.')[0]}-${navBgActive.split('.')[1]} text-${navTextActive.split('.')[0]}-${navTextActive.split('.')[1]}`
                                    : `text-${navTextSubtle.split('.')[0]}-${navTextSubtle.split('.')[1]} hover:bg-${navBgHover.split('.')[0]}-${navBgHover.split('.')[1]}`
                                }
                              `}
                            >
                              <Flex alignItems="center" gap={2}>
                                {subItem.icon && <span>{subItem.icon}</span>}
                                <span>{subItem.label}</span>
                              </Flex>
                            </RouterLink>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                // Simple menu item (no submenu)
                <>
                  {collapsed ? (
                    <Tooltip label={item.label} placement="right">
                      <Box>
                        <RouterLink
                          to={item.path}
                          className={({ isActive }) => `
                            flex items-center justify-center px-2 py-2.5 rounded-lg text-sm font-medium transition duration-200 ease-in-out
                            ${
                              isActive
                                ? `bg-${navBgActive.split('.')[0]}-${navBgActive.split('.')[1]} text-${navTextActive.split('.')[0]}-${navTextActive.split('.')[1]}`
                                : `text-${navText.split('.')[0]}-${navText.split('.')[1]} hover:bg-${navBgHover.split('.')[0]}-${navBgHover.split('.')[1]}`
                            }
                          `}
                        >
                          <Flex 
                            alignItems="center" 
                            justifyContent="center" 
                            w={7} 
                            h={7}
                          >
                            {item.icon}
                          </Flex>
                        </RouterLink>
                      </Box>
                    </Tooltip>
                  ) : (
                    <RouterLink
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition duration-200 ease-in-out
                        ${
                          isActive
                            ? `bg-${navBgActive.split('.')[0]}-${navBgActive.split('.')[1]} text-${navTextActive.split('.')[0]}-${navTextActive.split('.')[1]}`
                            : `text-${navText.split('.')[0]}-${navText.split('.')[1]} hover:bg-${navBgHover.split('.')[0]}-${navBgHover.split('.')[1]}`
                        }
                      `}
                    >
                      <Flex 
                        alignItems="center" 
                        justifyContent="center" 
                        w={7} 
                        h={7}
                      >
                        {item.icon}
                      </Flex>
                      <span>{item.label}</span>
                    </RouterLink>
                  )}
                </>
              )}
            </Box>
          ))}
        </Box>
      </Box>
      
      {/* Help section at the bottom */}
      {!collapsed && (
        <Box 
          mt="auto" 
          p={4} 
          borderTop="1px" 
          borderColor={borderColor}
        >
          <Box 
            bg={helpBg}
            borderRadius="xl" 
            p={4}
          >
            <Text 
              fontSize="sm" 
              fontWeight="medium" 
              color={helpText}
              mb={2}
            >
              需要帮助?
            </Text>
            <Text 
              fontSize="xs" 
              color={helpTextSecondary}
              mb={3}
            >
              查看我们的文档获取支持和帮助
            </Text>
            <Box
              as="a"
              href="#"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              w="full"
              px={3}
              py={1.5}
              fontSize="xs"
              fontWeight="medium"
              borderRadius="lg"
              bg="primary.600"
              color="white"
              _hover={{ bg: "primary.700" }}
              transition="all 0.2s ease-in-out"
            >
              查看文档
            </Box>
          </Box>
        </Box>
      )}
    </Flex>
  );
};

export default Sidebar;
