/**
 * Routes Configuration
 * 
 * 定义应用的路由配置，包括路径、组件和菜单项
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
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
import MenuManagement from '../pages/system/MenuManagement';

// 懒加载的组件
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const UserManagement = React.lazy(() => import('../pages/user/UserManagement'));
const ContentManagement = React.lazy(() => import('../pages/ContentManagement'));

const TableDemo = React.lazy(() => import('../pages/TableDemo'));

const Settings = React.lazy(() => import('../pages/Settings'));


// 简单页面占位组件
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: '20px' }}>
    <h1>{title}</h1>
    <p>This is a placeholder page for {title}.</p>
  </div>
);

// 示例页面
const AnalyticsPage = () => <PlaceholderPage title="数据分析" />;
const ProductsPage = () => <PlaceholderPage title="产品管理" />;
const PermissionsPage = () => <PlaceholderPage title="权限管理" />;

// 创建一个函数获取路由配置，这样可以在函数内部使用hooks
export const useRoutes = (): Route[] => {
  const { t } = useTranslation();
  
  return [
    {
      path: '/',
      component: Dashboard,
      exact: true,
      menu: {
        title: t('navigation:dashboard'),
        icon: <FiHome />,
      },
    },
    {
      path: '/users',
      component: UserManagement,
      menu: {
        title: t('navigation:users'),
        icon: <FiUsers />,
      },
    },
    {
      path: '/content',
      component: ContentManagement,
      menu: {
        title: t('navigation:content', '内容管理'),
        icon: <FiFileText />,
      },
    },
    {
      path: '/analytics',
      component: AnalyticsPage,
      menu: {
        title: t('navigation:analytics', '数据分析'),
        icon: <FiBarChart2 />,
      },
    },
    {
      path: '/components',
      component: () => null, // 父级路由不需要组件渲染
      menu: {
        title: t('navigation:components', '组件示例'),
        icon: <FiGrid />,
        children: [
          {
            path: '/components/table',
            component: TableDemo,
            menu: {
              title: t('navigation:tables'),
              icon: <FiTable />,
            },
          },
        ],
      },
    },
    {
      path: '/products',
      component: ProductsPage,
      menu: {
        title: t('navigation:products', '产品管理'),
        icon: <FiBox />,
        children: [
          {
            path: '/products/list',
            component: () => <PlaceholderPage title={t('navigation:productList', '产品列表')} />,
            menu: {
              title: t('navigation:productList', '产品列表'),
            },
          },
          {
            path: '/products/categories',
            component: () => <PlaceholderPage title={t('navigation:productCategories', '产品分类')} />,
            menu: {
              title: t('navigation:productCategories', '产品分类'),
            },
          },
        ],
      },
    },
    {
      path: '/system',
      component: () => null, // 父级路由不需要组件渲染
      menu: {
        title: t('navigation:system'),
        icon: <FiLayers />,
        children: [
          {
            path: '/system/settings',
            component: Settings,
            menu: {
              title: t('navigation:settings'),
            },
          },
          {
            path: '/system/menu',
            component: MenuManagement,
            menu: {
              title: t('menu:management'),
            },
          },
          {
            path: '/system/permissions',
            component: PermissionsPage,
            menu: {
              title: t('navigation:permissions'),
              icon: <FiShield />,
            },
          },
        ],
      },
    },
  ];
};

// 移除错误的顶层hook调用
export default useRoutes;
