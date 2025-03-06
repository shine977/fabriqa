/**
 * Routes Component
 * 
 * 路由组件，负责应用的路由渲染和配置
 */

import React, { Suspense } from 'react';
import { Routes, Route as RouterRoute, Navigate } from 'react-router-dom';
import { Box, Spinner, Center } from '@chakra-ui/react';
import routes from './routes';
import MainLayout from '../layouts/MainLayout';
import { flattenRoutes } from '../utils/routes';
import { usePluginSystem } from '../plugins/pluginSystem';

// 加载中组件
const LoadingComponent: React.FC = () => (
  <Center h="100vh">
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      color="brand.500"
      size="xl"
    />
  </Center>
);

// 路由组件
const AppRoutes: React.FC = () => {
  const pluginSystem = usePluginSystem();
  
  // 通过插件系统处理路由配置
  const processedRoutes = pluginSystem.applyHooks('routes:process', routes);
  
  // 将嵌套路由展平为一维数组，方便渲染
  const flatRoutes = flattenRoutes(processedRoutes);

  return (
    <Suspense fallback={<LoadingComponent />}>
      <Routes>
        {/* 主应用路由 */}
        <RouterRoute path="/" element={<MainLayout />}>
          {flatRoutes.map((route) => (
            <RouterRoute
              key={route.path}
              path={route.path}
              element={
                <Suspense fallback={<Box p={5}><Spinner /></Box>}>
                  <route.component />
                </Suspense>
              }
            />
          ))}
          
          {/* 默认路由 - 重定向到首页 */}
          <RouterRoute path="*" element={<Navigate to="/" replace />} />
        </RouterRoute>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
