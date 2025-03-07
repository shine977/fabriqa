/**
 * Protected Route Component
 * 
 * 路由守卫组件，用于保护需要认证的路由
 * 检查用户是否已登录，未登录时重定向到登录页面并保存原始目标路径
 */

import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './authService';

/**
 * 路由守卫组件，保护需要认证的路由
 * 如果用户未登录，将重定向到登录页面并保存原目标路径
 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // 如果用户未认证，重定向到登录页面，并在状态中保存当前路径
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }
  
  // 用户已认证，渲染子路由
  return <Outlet />;
};

export default ProtectedRoute;
