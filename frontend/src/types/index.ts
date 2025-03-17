/**
 * Types
 *
 * 类型定义文件，包含系统中使用的所有类型定义
 */

import React from 'react';

// ==============================
// 路由相关类型
// ==============================

/**
 * 路由定义
 */
export interface Route {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  menu?: {
    title: string;
    icon?: React.ReactNode;
    children?: Route[];
  };
  parent?: Route;
}

// ==============================
// 表格相关类型
// ==============================

/**
 * 表格列定义
 */
export interface TableColumn {
  id: string;
  header: string;
  accessor: string;
  cell?: (value: any, row?: any) => any;
  minWidth?: string;
  maxWidth?: string;
  width?: string;
  isNumeric?: boolean;
  isSortable?: boolean;
  render?: (value: any, row: any, rowIndex: number) => React.ReactNode;
}

/**
 * 表格分页信息
 */
export interface TablePagination {
  pageSize: number;
  currentPage?: number;
  totalCount: number;
}

/**
 * 表格操作按钮定义
 */
export interface TableAction {
  icon?: React.ReactNode;
  label: string;
  onClick: (row: any) => void;
  colorScheme?: string;
  isDisabled?: (row: any) => boolean;
}

// ==============================
// 表单相关类型
// ==============================

/**
 * 表单字段选项
 */
export interface FormFieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

/**
 * 表单字段定义
 */
export interface FormField {
  id: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'textarea'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'switch'
    | 'date'
    | 'time'
    | 'datetime'
    | 'file';
  placeholder?: string;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  min?: number;
  max?: number;
  rows?: number;
  cols?: number;
  options?: FormFieldOption[];
  multiple?: boolean;
  defaultValue?: any;
  hidden?: boolean;
  // 自定义渲染函数
  render?: (field: FormField, value: any, onChange: (value: any) => void) => React.ReactNode;
  // 自定义验证函数
  validate?: (value: any) => string | null;
}

// ==============================
// 插件相关类型
// ==============================

/**
 * 插件上下文
 */
export interface PluginContext {
  registerHook: (hookName: string, handler: Function) => void;
}

/**
 * 插件定义
 */
export interface Plugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  enabled: boolean;
  priority?: number;
  hooks?: Record<string, Function>;
  initialize?: (pluginSystem: any) => void;
  _initialized?: boolean;
}

// ==============================
// API相关类型
// ==============================

export interface SingleItemResponse<T> {
  code: number;
  item: T;
  message: string;
}

export interface MultiItemsResponse<T> {
  code: number;
  message: string;
  items: T[];
}
export type ApiResponse<T, IsArray extends boolean = false> = IsArray extends true
  ? MultiItemsResponse<T>
  : SingleItemResponse<T>;

// ==============================
// 用户相关类型
// ==============================

/**
 * 用户信息
 */
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  permissions?: string[];
}

/**
 * 认证状态
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token?: string;
}

// ==============================
// 通知相关类型
// ==============================

/**
 * 通知类型
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

// ==============================
// 主题相关类型
// ==============================

/**
 * 主题配置
 */
export interface ThemeConfig {
  colorMode: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: number;
  borderRadius: string;
}
