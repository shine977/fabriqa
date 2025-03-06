import { Type } from '@nestjs/common';
import { PluginMetadata } from '../interfaces/plugin.interface';

export enum PluginStatus {
  PENDING = 'pending', // 等待安装
  INSTALLING = 'installing', // 安装中
  INSTALLED = 'installed', // 已安装
  ENABLING = 'enabling', // 启用中
  ENABLED = 'enabled', // 已启用
  DISABLING = 'disabling', // 禁用中
  DISABLED = 'disabled', // 已禁用
  UPGRADING = 'upgrading', // 升级中
  UNINSTALLING = 'uninstalling', // 卸载中
  ERROR = 'error', // 错误状态
}

export enum PluginType {
  SYSTEM = 'system', // 系统插件
  CORE = 'core', // 核心插件
  EXTENSION = 'extension', // 扩展插件
  THEME = 'theme', // 主题插件
}

export interface PluginDefinition {
  module: Type<any>;
  enabled: boolean;
  order: number;
  type: PluginType;
  dependencies?: string[];
}

export interface PluginConfig {
  /**
   * 插件目录路径
   */
  pluginDir: string;

  /**
   * 系统插件列表
   */
  systemPlugins: string[];

  /**
   * 最大并发加载数
   */
  maxConcurrentLoads: number;

  autoDiscovery?: boolean; // 是否自动发现插件
  pluginsDir?: string; // 插件目录
  maxRetries?: number; // 最大重试次数
  retryDelay?: number; // 重试延迟(ms)
  timeout?: number; // 超时时间(ms)
}

// export interface PluginMetadata {
//   id: string; // 插件ID
//   name: string; // 插件名称
//   description?: string; // 插件描述
//   version: string; // 插件版本
//   type: PluginType; // 插件类型
//   author?: string; // 作者
//   homepage?: string; // 主页
//   repository?: string; // 仓库地址
//   dependencies?: string[]; // 依赖的其他插件
//   requiredVersion?: string; // 所需的系统版本
//   configSchema?: any; // 配置模式
//   tags?: string[]; // 标签
// }

export interface PluginInfo extends PluginMetadata {
  status: PluginStatus; // 当前状态
  error?: string; // 错误信息
  installedAt?: Date; // 安装时间
  updatedAt?: Date; // 更新时间
  config?: any; // 当前配置
}

export interface PluginOptions {
  /**
   * 插件目录路径
   */
  pluginDir?: string;

  /**
   * 系统插件列表
   */
  systemPlugins?: string[];

  /**
   * 最大并发加载数
   */
  maxConcurrentLoads?: number;
}
