import { Type } from '@nestjs/common';

export enum PluginType {
  SYSTEM = 'system',
  PERMISSION = 'permission',
  WORKFLOW = 'workflow',
  INTEGRATION = 'integration',
  REPORT = 'report',
  DATA_PROCESSOR = 'data_processor',
  CUSTOM = 'custom',
}
export enum PluginStatus {
  INSTALLED = 'installed',
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  ERROR = 'error',
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
