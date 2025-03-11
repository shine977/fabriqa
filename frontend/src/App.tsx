/**
 * App Component
 * 
 * 应用主入口，提供路由配置和全局上下文
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ApplicationPluginProvider } from './plugins';
import AppRoutes from './routes';

const App: React.FC = () => {
  return (
    <BrowserRouter basename="/">
      <ApplicationPluginProvider>
        <AppRoutes />
      </ApplicationPluginProvider>
    </BrowserRouter>
  );
};

export default App;
