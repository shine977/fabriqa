import { Injectable, Logger, DynamicModule, Type, Inject, Module } from '@nestjs/common';
import { ModuleRef, ContextIdFactory } from '@nestjs/core';
import { ApplicationPlugin, PluginContext, PluginMetadata, PluginState } from '../interfaces/plugin.interface';
import { PluginServiceRegistry } from './plugin.service-registry';
import { PluginDependencyResolver } from './plugin.dependency-resolver';
import { join } from 'path';
import { promises as fs } from 'fs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PluginRegistry } from './plugin.registry';

@Injectable()
export class PluginLoader {
  private readonly logger = new Logger(PluginLoader.name);
  private readonly loadedPlugins = new Map<string, ApplicationPlugin>();

  constructor(
    private readonly serviceRegistry: PluginServiceRegistry,
    private readonly dependencyResolver: PluginDependencyResolver,
    private readonly moduleRef: ModuleRef,
    private readonly configService: ConfigService,
    private readonly pluginRegistry: PluginRegistry,
    @Inject('PLUGIN_CONFIG') private readonly pluginConfig: any,
  ) {}

  async load(pluginId: string): Promise<ApplicationPlugin | undefined> {
    try {
      this.logger.debug(`Loading plugin: ${pluginId}`);

      // 1. 加载插件
      const plugin = await this.loadPluginModule(pluginId);

      if (!plugin) {
        this.logger.error(`Failed to load plugin module: ${pluginId}`);
        return undefined;
      }

      // 2. 验证插件
      if (!(await this.validatePlugin(plugin))) {
        throw new Error(`Plugin validation failed: ${pluginId}`);
      }

      // 3. 解析依赖
      const allPlugins = [...this.loadedPlugins.values(), plugin];
      try {
        const loadOrder = await this.dependencyResolver.resolveDependencies(allPlugins);

        // 获取插件的元数据
        const metadata = this.getPluginMetadata(plugin.constructor, pluginId);
        if (!metadata || !metadata.dependencies) {
          this.logger.debug(`No dependencies defined for plugin ${pluginId}`);
        } else {
          // 检查插件声明的依赖
          for (const depId of metadata.dependencies) {
            if (!this.loadedPlugins.has(depId)) {
              this.logger.error(`Missing dependency for ${pluginId}: ${depId}`);
              this.logger.debug(`Currently loaded plugins: ${[...this.loadedPlugins.keys()].join(', ')}`);
              throw new Error(`Required dependency not loaded: ${depId}`);
            }
          }
        }
      } catch (depError) {
        this.logger.error(`Dependency resolution failed for ${pluginId}:`, depError);
        throw depError;
      }

      // 4. 注入依赖的服务
      await this.injectDependencies(plugin);

      // 5. 保存到已加载插件列表，使用插件自己定义的ID
      const actualPluginId = plugin.metadata?.pluginId || pluginId;
      this.loadedPlugins.set(actualPluginId, plugin);

      // 同时也用传入的ID注册，确保两种方式都能找到插件
      if (actualPluginId !== pluginId) {
        this.loadedPlugins.set(pluginId, plugin);
      }

      // 6. 注册到插件注册表（如果还未注册）
      if (!this.pluginRegistry.hasPlugin(pluginId)) {
        await this.pluginRegistry.register(plugin);
      }

      return plugin;
    } catch (error) {
      this.logger.error(`Failed to load plugin ${pluginId}:`, error);
      throw error;
    }
  }

  private resolvePluginPath(pluginId: string): string {
    // 1. 首先使用注入的插件配置
    if (this.pluginConfig?.pluginDir) {
      return join(this.pluginConfig.pluginDir, pluginId);
    }

    // 2. 然后尝试从配置服务获取
    const configPath = this.configService.get<string>('plugin.pluginDir');
    if (configPath) {
      return join(configPath, pluginId);
    }

    // 3. 最后使用默认路径
    return join(process.cwd(), 'src', 'plugins', pluginId);
  }

  private async validatePluginDirectory(pluginPath: string): Promise<void> {
    try {
      const stats = await fs.stat(pluginPath);

      if (!stats.isDirectory()) {
        this.logger.warn(`Plugin path exists but is not a directory: ${pluginPath}`);
        return;
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.logger.warn(`Plugin directory not found: ${pluginPath}`);
        return;
      }
      throw error;
    }
  }

  private getPluginMetadata(PluginClass: any, pluginId: string): PluginMetadata | undefined {
    this.logger.debug(`Getting metadata for plugin: ${pluginId}`);

    let metadata: PluginMetadata | undefined;

    try {
      // 1. 尝试从实例属性获取
      const instance = new PluginClass();
      if (instance.metadata) {
        this.logger.debug('Found metadata in instance property');
        metadata = instance.metadata;
      }
    } catch (error) {
      this.logger.warn(`Failed to create instance for metadata: ${error.message}`);
    }

    // 2. 尝试从静态属性获取
    if (!metadata && PluginClass.metadata) {
      this.logger.debug('Found metadata in static property');
      metadata = PluginClass.metadata;
    }

    // 3. 尝试从装饰器元数据获取
    if (!metadata) {
      const decoratorMetadata = Reflect.getMetadata('plugin:metadata', PluginClass);
      if (decoratorMetadata) {
        this.logger.debug('Found metadata in decorator');
        metadata = decoratorMetadata;
      }
    }

    // 4. 尝试从原型获取
    if (!metadata && PluginClass.prototype.metadata) {
      this.logger.debug('Found metadata in prototype');
      metadata = PluginClass.prototype.metadata;
    }

    if (!metadata) {
      this.logger.warn('No metadata found for plugin through any method');
      return undefined;
    }

    // 验证和补充元数据
    if (!metadata.pluginId) {
      metadata.pluginId = pluginId;
    }

    return metadata;
  }

  private async loadPluginModule(pluginId: string): Promise<ApplicationPlugin | undefined> {
    console.log('loadPluginModule pluginId', pluginId);
    const pluginPath = this.resolvePluginPath(pluginId);

    try {
      await this.validatePluginDirectory(pluginPath);
      const entryFile = await this.findPluginEntryFile(pluginPath, { name: pluginId });
      const entryPath = join(pluginPath, entryFile);

      try {
        const module = await import(entryPath);
        const PluginClass = module.default || Object.values(module)[0];

        if (!PluginClass || typeof PluginClass !== 'function') {
          throw new Error('Invalid plugin module: must export a class');
        }
        const plugin = await this.createPluginInstance(PluginClass);
        if (!plugin) {
          throw new Error(`Failed to create plugin instance for ${pluginId}`);
        }
        // 使用新的元数据获取方法
        const metadata = this.getPluginMetadata(PluginClass, pluginId);
        if (!metadata) {
          throw new Error(`Plugin metadata not found for ${pluginId}`);
        }

        // 确保必要的元数据字段
        if (!metadata.pluginId) {
          metadata.pluginId = pluginId;
        }

        return plugin;
      } catch (error) {
        this.logger.error(`Failed to load plugin module: ${error.message}`);
        throw error;
      }
    } catch (error) {
      this.logger.error(`Failed to load plugin module: ${error.message}`);
      throw error;
    }
  }

  private async findPluginEntryFile(pluginPath: string, config: any): Promise<string> {
    const possibleEntries = [
      // 1. 标准命名约定
      `${config.name}.plugin.js`,
      `${config.name}.plugin.ts`,
      'index.plugin.js',
      'index.plugin.ts',

      // 2. 传统命名约定
      'index.js',
      'index.ts',
      'main.js',
      'main.ts',
    ];

    for (const entry of possibleEntries) {
      const entryPath = join(pluginPath, entry);
      try {
        await fs.access(entryPath);
        return entry;
      } catch {
        continue;
      }
    }

    throw new Error(`No valid entry file found in plugin directory: ${pluginPath}`);
  }

  private async validatePlugin(plugin: ApplicationPlugin): Promise<boolean> {
    try {
      // 验证插件元数据
      if (!plugin.metadata || !plugin.metadata.pluginId) {
        throw new Error('Invalid plugin metadata');
      }

      // 验证必需的生命周期方法
      const requiredMethods = ['onInstall', 'onEnable', 'onDisable', 'onUninstall'];
      for (const method of requiredMethods) {
        if (typeof plugin[method] !== 'function') {
          throw new Error(`Plugin must implement ${method} method`);
        }
      }

      return true;
    } catch (error) {
      this.logger.error('Plugin validation failed:', error);
      return false;
    }
  }

  private async createPluginInstance(PluginClass: Type<any>): Promise<ApplicationPlugin | undefined> {
    try {
      // 获取构造函数参数的注入元数据
      const paramTypes = Reflect.getMetadata('design:paramtypes', PluginClass) || [];
      const injectMetadata = Reflect.getMetadata('custom:paramtypes', PluginClass) || [];

      // NestJS 的注入元数据
      const nestInjectTokens = [];
      const params = Reflect.getMetadata('design:paramtypes', PluginClass) || [];
      for (let i = 0; i < params.length; i++) {
        const metadata = Reflect.getMetadata('inject', PluginClass, `param:${i}`);
        if (metadata) {
          nestInjectTokens[i] = metadata;
        }
      }

      const constructorParams = [];
      console.log('paramTypes', paramTypes, 'injectMetadata', injectMetadata, 'nestInjectTokens', nestInjectTokens);

      // 准备构造函数参数
      for (let i = 0; i < paramTypes.length; i++) {
        // 首先检查 NestJS 的 @Inject 装饰器
        const nestToken = nestInjectTokens[i];
        // 然后检查我们自定义的 InjectService 装饰器
        const customToken = injectMetadata[i];
        // 使用 NestJS 的 token，如果没有则使用自定义的 token
        const token = nestToken || customToken;
        console.log('token', token);

        if (token) {
          try {
            // 首先尝试从 ModuleRef 获取
            const service = await this.moduleRef.get(token, { strict: false });
            if (service) {
              constructorParams.push(service);
              continue;
            }
          } catch (error) {
            this.logger.debug(`Service ${token} not found in ModuleRef, trying service registry`);
          }

          // 如果从 ModuleRef 获取失败，尝试从服务注册表获取
          try {
            const service = await this.serviceRegistry.getService(token);
            if (service) {
              constructorParams.push(service);
              continue;
            }
          } catch (error) {
            this.logger.debug(`Service ${token} not found in service registry`);
          }

          this.logger.warn(`Service ${token} not found for plugin constructor`);
          constructorParams.push(undefined);
        } else {
          // 如果没有注入标记，尝试使用类型本身
          const paramType = paramTypes[i];
          try {
            const service = await this.moduleRef.get(paramType, { strict: false });
            if (service) {
              constructorParams.push(service);
              continue;
            }
          } catch (error) {
            this.logger.debug(`Service not found for type ${paramType?.name}`);
            constructorParams.push(undefined);
          }
        }
      }

      // 实例化插件
      const plugin = new PluginClass(...constructorParams);
      if (!plugin) {
        throw new Error('Failed to create plugin instance');
      }

      return plugin;
    } catch (error) {
      this.logger.error('Failed to create plugin instance:', error);
      throw error;
    }
  }

  private async injectDependencies(plugin: ApplicationPlugin): Promise<void> {
    try {
      // 获取所有带有 @Inject 装饰器的属性
      const propertyKeys = Reflect.getMetadataKeys(plugin.constructor.prototype);

      for (const key of propertyKeys) {
        if (!key.startsWith('custom:inject:')) continue;

        const propertyKey = key.replace('custom:inject:', '');
        const injectToken = Reflect.getMetadata(key, plugin.constructor.prototype);

        if (!injectToken) continue;

        try {
          // 首先尝试从 ModuleRef 获取
          const service = await this.moduleRef.resolve(injectToken);
          if (service) {
            Reflect.set(plugin, propertyKey, service);
            continue;
          }
        } catch (error) {
          this.logger.debug(
            `Service ${injectToken} not found in ModuleRef for property ${propertyKey}, trying service registry`,
          );
        }

        // 如果从 ModuleRef 获取失败，尝试从服务注册表获取
        try {
          const service = await this.serviceRegistry.getService(injectToken);
          if (service) {
            Reflect.set(plugin, propertyKey, service);
            continue;
          }
        } catch (error) {
          this.logger.debug(`Service ${injectToken} not found in service registry for property ${propertyKey}`);
        }

        this.logger.warn(`Service ${injectToken} not found for property ${propertyKey}`);
      }
    } catch (error) {
      this.logger.error('Failed to inject dependencies:', error);
      throw error;
    }
  }

  private async validatePluginInstance(plugin: ApplicationPlugin): Promise<boolean> {
    if (!plugin) return false;
    if (!plugin.metadata) return false;
    if (!plugin.metadata.pluginId) return false;
    if (!plugin.metadata.type) return false;
    return true;
  }

  private async resolveModuleDependencies(moduleRef: ModuleRef, token: any): Promise<void> {
    try {
      const instance = moduleRef.get(token);
      if (!instance) return;

      const metadata = Reflect.getMetadata('design:paramtypes', instance.constructor) || [];
      for (const dependency of metadata) {
        try {
          await moduleRef.resolve(dependency);
        } catch (error) {
          this.logger.warn(`Failed to resolve dependency ${dependency.name}: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to resolve dependencies for ${token.name}: ${error.message}`);
    }
  }
}
