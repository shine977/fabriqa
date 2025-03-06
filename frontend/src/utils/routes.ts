/**
 * Route Utilities
 * 
 * 路由相关的工具函数
 */

import { Route } from '../types';

/**
 * 将嵌套路由展平为一维数组
 * 这使得渲染变得更简单
 * 
 * @param routes 嵌套路由数组
 * @returns 展平后的路由数组
 */
export const flattenRoutes = (routes: Route[]): Route[] => {
  let flatRoutes: Route[] = [];
  
  routes.forEach(route => {
    // 添加当前路由（如果有component）
    if (route.component) {
      flatRoutes.push(route);
    }
    
    // 递归处理子路由
    if (route.menu?.children && route.menu.children.length > 0) {
      const childRoutes = route.menu.children
        .filter(childRoute => childRoute.path)
        .map(childRoute => ({
          ...childRoute,
          // 保持原路径，React Router v6 不需要连接父路径
          parent: route
        }));
      
      flatRoutes = [...flatRoutes, ...flattenRoutes(childRoutes)];
    }
  });
  
  return flatRoutes;
};

/**
 * 获取可在菜单中显示的路由
 * 
 * @param routes 路由配置
 * @returns 可在菜单中显示的路由
 */
export const getMenuRoutes = (routes: Route[]): Route[] => {
  return routes.filter(route => route.menu);
};

/**
 * 根据路径查找路由
 * 
 * @param routes 路由数组
 * @param path 路径
 * @returns 找到的路由，如果没找到则返回undefined
 */
export const findRouteByPath = (routes: Route[], path: string): Route | undefined => {
  // 展平路由以便于搜索
  const flatRoutes = flattenRoutes(routes);
  
  // 查找完全匹配的路由
  return flatRoutes.find(route => route.path === path);
};

/**
 * 获取路由的完整路径名称（面包屑使用）
 * 
 * @param route 路由对象
 * @returns 路径名称数组
 */
export const getRoutePathNames = (route: Route): { title: string; path: string }[] => {
  const pathNames: { title: string; path: string }[] = [];
  
  // 添加当前路由
  if (route.menu?.title) {
    pathNames.unshift({
      title: route.menu.title,
      path: route.path
    });
  }
  
  // 递归添加父路由
  let currentRoute: Route | undefined = route.parent;
  while (currentRoute) {
    if (currentRoute.menu?.title) {
      pathNames.unshift({
        title: currentRoute.menu.title,
        path: currentRoute.path
      });
    }
    currentRoute = currentRoute.parent;
  }
  
  return pathNames;
};
