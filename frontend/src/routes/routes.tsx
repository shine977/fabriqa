/**
 * Routes Configuration
 * 
 * 定义应用的路由配置，包括路径、组件和菜单项
 */

import React from 'react';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiBarChart2,
  FiLayers,
  FiBox,
  FiShield,
  FiTable,
  FiGrid
} from 'react-icons/fi';
import { Route } from '../types';

// 页面组件（使用懒加载提高性能）
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const ContentManagement = React.lazy(() => import('../pages/ContentManagement'));
const Settings = React.lazy(() => import('../pages/Settings'));
const TableDemo = React.lazy(() => import('../pages/TableDemo'));
// 用户管理组件
const UserManagement = React.lazy(() => import('../pages/user/UserManagement'));

// 示例的未实现页面（使用占位符组件）
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: '20px' }}>
    <h1>{title} 页面</h1>
    <p>此页面尚未实现。</p>
  </div>
);

const Analytics = () => <PlaceholderPage title="数据分析" />;
const Products = () => <PlaceholderPage title="产品管理" />;
const Permissions = () => <PlaceholderPage title="权限管理" />;

// 路由配置
const routes: Route[] = [
  {
    path: '/',
    component: Dashboard,
    exact: true,
    menu: {
      title: '仪表盘',
      icon: <FiHome />,
    },
  },
  {
    path: '/users',
    component: UserManagement,
    menu: {
      title: '用户管理',
      icon: <FiUsers />,
    },
  },
  {
    path: '/content',
    component: ContentManagement,
    menu: {
      title: '内容管理',
      icon: <FiFileText />,
    },
  },
  {
    path: '/analytics',
    component: Analytics,
    menu: {
      title: '数据分析',
      icon: <FiBarChart2 />,
    },
  },
  {
    path: '/components',
    component: () => null, // 父级路由不需要组件渲染
    menu: {
      title: '组件示例',
      icon: <FiGrid />,
      children: [
        {
          path: '/components/table',
          component: TableDemo,
          menu: {
            title: '数据表格',
            icon: <FiTable />,
          },
        },
      ],
    },
  },
  {
    path: '/products',
    component: Products,
    menu: {
      title: '产品管理',
      icon: <FiBox />,
      children: [
        {
          path: '/products/list',
          component: () => <PlaceholderPage title="产品列表" />,
          menu: {
            title: '产品列表',
          },
        },
        {
          path: '/products/categories',
          component: () => <PlaceholderPage title="产品分类" />,
          menu: {
            title: '产品分类',
          },
        },
      ],
    },
  },
  {
    path: '/system',
    component: () => null, // 父级路由不需要组件渲染
    menu: {
      title: '系统管理',
      icon: <FiLayers />,
      children: [
        {
          path: '/system/settings',
          component: Settings,
          menu: {
            title: '系统设置',
          },
        },
        {
          path: '/system/permissions',
          component: Permissions,
          menu: {
            title: '权限管理',
            icon: <FiShield />,
          },
        },
      ],
    },
  },
];

export default routes;
