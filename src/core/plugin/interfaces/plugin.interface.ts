import { PluginType } from '../types/plugin.type';

export enum PluginState {
  LOADING = 'loading',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  INSTALLING = 'installing',
  INSTALLED = 'installed',
  ENABLING = 'enabling',
  ENABLED = 'enabled',
  DISABLING = 'disabling',
  DISABLED = 'disabled',
  ERROR = 'error',
  UPGRADING = 'upgrading',
  UPGRADED = 'upgraded',
  UNINSTALLING = 'uninstalling',
  REGISTERING = 'registering',
  REGISTERED = 'registered',
  UNINSTALLED = 'uninstalled',
}

export interface PluginMetadata {
  pluginId: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies?: string[];
  type: PluginType;
  minHostVersion?: string; // 最低主程序版本要求
  maxHostVersion?: string; // 最高主程序版本要求
  configSchema?: Record<string, any>; // 配置模式
  permissions?: string[]; // 需要的权限
}

export interface PluginContext {
  tenantId?: string;
  userId?: string;
  state?: PluginState;
  config?: Record<string, any>;
  [key: string]: any;
}

export interface PluginLifecycle {
  // 注册阶段
  onBeforeRegister?(context: PluginContext): Promise<void>; // 注册前
  onRegister?(context: PluginContext): Promise<void>; // 注册时
  onAfterRegister?(context: PluginContext): Promise<void>; // 注册后

  // 初始化阶段
  onLoad?(context: PluginContext): Promise<void>; // 插件加载时
  onInit?(context: PluginContext): Promise<void>; // 插件初始化时

  // 安装阶段
  onBeforeInstall?(context: PluginContext): Promise<void>; // 安装前
  onInstall?(context: PluginContext): Promise<void>; // 安装时
  onAfterInstall?(context: PluginContext): Promise<void>; // 安装后

  // 启用/禁用阶段
  onBeforeEnable?(context: PluginContext): Promise<void>; // 启用前
  onEnable?(context: PluginContext): Promise<void>; // 启用时
  onAfterEnable?(context: PluginContext): Promise<void>; // 启用后
  onBeforeDisable?(context: PluginContext): Promise<void>; // 禁用前
  onDisable?(context: PluginContext): Promise<void>; // 禁用时
  onAfterDisable?(context: PluginContext): Promise<void>; // 禁用后

  // 升级阶段
  onBeforeUpgrade?(context: PluginContext, fromVersion: string): Promise<void>; // 升级前
  onUpgrade?(context: PluginContext, fromVersion: string): Promise<void>; // 升级时
  onAfterUpgrade?(context: PluginContext, fromVersion: string): Promise<void>; // 升级后

  // 卸载阶段
  onBeforeUninstall?(context: PluginContext): Promise<void>; // 卸载前
  onUninstall?(context: PluginContext): Promise<void>; // 卸载时
  onAfterUninstall?(context: PluginContext): Promise<void>; // 卸载后

  // 错误处理
  onError(context: PluginContext, error: Error): Promise<void>; // 发生错误时
}

export interface BasePlugin extends PluginLifecycle {
  metadata: PluginMetadata;
  getPluginMetadata(): PluginMetadata;
  getState?(): PluginState;
  validateConfig?(config: Record<string, any>): Promise<boolean>;
  getConfig?(): Record<string, any>;
}

// 元数据提供者接口
export interface MetadataProvider {
  priority: number;
  getMetadata(target: any): PluginMetadata | undefined;
}

// 实例属性元数据提供者
export class InstanceMetadataProvider implements MetadataProvider {
  priority = 1;
  getMetadata(target: any): PluginMetadata | undefined {
    return target.metadata;
  }
}

// 静态属性元数据提供者
export class StaticMetadataProvider implements MetadataProvider {
  priority = 2;
  getMetadata(target: any): PluginMetadata | undefined {
    return target.constructor.metadata;
  }
}

// 原型方法元数据提供者
export class PrototypeMetadataProvider implements MetadataProvider {
  priority = 3;
  getMetadata(target: any): PluginMetadata | undefined {
    if (typeof target['getMetadata'] === 'function') {
      return target['getMetadata']();
    }
    return undefined;
  }
}

// 装饰器元数据提供者
export class DecoratorMetadataProvider implements MetadataProvider {
  priority = 4;
  getMetadata(target: any): PluginMetadata | undefined {
    return Reflect.getMetadata('plugin:metadata', target.constructor);
  }
}

// 服务装饰器元数据提供者
export class ServiceMetadataProvider implements MetadataProvider {
  priority = 5;
  getMetadata(target: any): PluginMetadata | undefined {
    const serviceMetadata = Reflect.getMetadata('plugin:service', target.constructor);
    if (!serviceMetadata) return undefined;

    return {
      pluginId: serviceMetadata.name || target.constructor.name.toLowerCase().replace('plugin', ''),
      name: serviceMetadata.name || target.constructor.name,
      version: serviceMetadata.version || '1.0.0',
      description: serviceMetadata.description || '',
      author: serviceMetadata.author || 'System',
      type: serviceMetadata.type || PluginType.SYSTEM,
      dependencies: serviceMetadata.dependencies || [],
    };
  }
}

export abstract class ApplicationPlugin implements PluginLifecycle {
  private static readonly metadataProviders: MetadataProvider[] = [
    new InstanceMetadataProvider(),
    new StaticMetadataProvider(),
    new PrototypeMetadataProvider(),
    new DecoratorMetadataProvider(),
    new ServiceMetadataProvider(),
  ].sort((a, b) => a.priority - b.priority);

  abstract metadata: PluginMetadata;
  abstract onError(context: PluginContext, error: Error): Promise<void>;
  getPluginMetadata?(): PluginMetadata;
  getState?(): PluginState;
  validateConfig?(config: Record<string, any>): Promise<boolean>;
  abstract getConfig(): Record<string, any>;
}
