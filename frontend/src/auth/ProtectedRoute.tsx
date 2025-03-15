/**
 * Protected Route Component
 * 
 * 路由守卫组件，用于保护需要认证的路由
 * 检查用户是否已登录，未登录时重定向到登录页面并保存原始目标路径
 */

import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * 路由守卫组件，保护需要认证的路由
 * 如果用户未登录，将重定向到登录页面并保存原目标路径
 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (location.pathname === '/login') {
    return isAuthenticated 
      ? <Navigate to="/" replace /> 
      : <Outlet />;
  }
  
  // 处理其他受保护页面
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
