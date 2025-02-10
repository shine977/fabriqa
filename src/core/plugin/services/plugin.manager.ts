// src/core/plugin/services/plugin.manager.ts
import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PluginType, PluginStatus, PluginConfig } from '../types/plugin.type';
import { PluginEntity } from '../entities/plugin.entity';
import { PluginRegistry } from './plugin.registry';
import { PluginEventBus } from './plugin.event-bus';
import { PluginLifecycleManager } from './plugin.lifecycle-manager';
import { PluginLoader } from './plugin.loader';
import { ApplicationPlugin, PluginContext } from '../interfaces/plugin.interface';
import { PluginDependencyResolver } from './plugin.dependency-resolver';

@Injectable()
export class PluginManager implements OnModuleInit {
  private readonly logger = new Logger(PluginManager.name);
  private readonly plugins = new Map<string, ApplicationPlugin>();
  private readonly pluginStatus = new Map<string, PluginStatus>();
  private initialized = false;

  constructor(
    @InjectRepository(PluginEntity)
    private readonly pluginRepository: Repository<PluginEntity>,
    @Inject('PLUGIN_CONFIG')
    private readonly config: PluginConfig,
    private readonly loader: PluginLoader,
    private readonly registry: PluginRegistry,
    private readonly eventBus: PluginEventBus,
    private readonly lifecycleManager: PluginLifecycleManager,
    private readonly dependencyResolver: PluginDependencyResolver,
  ) {}

  async onModuleInit() {
    if (this.initialized) {
      return;
    }

    try {
      // 加载系统插件
      if (this.config.systemPlugins?.length) {
        await Promise.all(this.config.systemPlugins.map(pluginId => this.loadPlugin(pluginId)));
      }

      // 加载已安装的租户插件
      const installedPlugins = await this.pluginRepository.find({
        where: { status: PluginStatus.ENABLED },
      });

      await Promise.all(installedPlugins.map(plugin => this.loadPlugin(plugin.id)));

      this.initialized = true;
      this.logger.log('Plugin manager initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize plugin manager:', error);
      throw error;
    }
  }

  async loadPlugin(pluginId: string, context?: PluginContext): Promise<void> {
    try {
      // 检查插件是否已加载
      if (this.plugins.has(pluginId)) {
        return;
      }

      const ctx = context || {};

      // 加载插件
      const plugin = await this.loader.load(pluginId);
      if (!plugin) {
        throw new Error(`Failed to load plugin: ${pluginId}`);
      }

      // 验证插件
      await this.validatePlugin(plugin);

      // 检查依赖
      await this.checkDependencies(plugin);

      // 执行加载生命周期
      await this.lifecycleManager.loadPlugin(plugin, ctx);

      // 注册插件
      await this.lifecycleManager.registerPlugin(plugin, ctx);
      await this.registry.register(plugin);

      // 存储插件实例
      this.plugins.set(pluginId, plugin);
      this.pluginStatus.set(pluginId, PluginStatus.INSTALLED);

      // 执行安装生命周期
      await this.lifecycleManager.installPlugin(plugin, ctx);

      // 启用插件
      await this.enablePlugin(pluginId, ctx);

      // 发布插件加载事件
      await this.eventBus.emit('plugin.loaded', { pluginId, context: ctx });

      this.logger.log(`Plugin ${pluginId} loaded successfully`);
    } catch (error) {
      this.logger.error(`Failed to load plugin ${pluginId}:`, error);
      this.pluginStatus.set(pluginId, PluginStatus.ERROR);
      throw error;
    }
  }

  async installPlugin(pluginId: string, context: PluginContext): Promise<void> {
    try {
      this.logger.log(`Installing plugin: ${pluginId}`);

      // 加载插件
      const plugin = await this.loader.load(pluginId);
      if (!plugin) {
        throw new Error(`Failed to load plugin: ${pluginId}`);
      }

      // 解析依赖
      await this.dependencyResolver.resolveDependencies([plugin]);

      // 执行加载生命周期
      await this.lifecycleManager.loadPlugin(plugin, context);

      // 执行注册生命周期
      await this.lifecycleManager.registerPlugin(plugin, context);
      await this.registry.register(plugin);

      // 执行安装生命周期
      await this.lifecycleManager.installPlugin(plugin, context);

      // 更新状态
      this.plugins.set(pluginId, plugin);
      this.pluginStatus.set(pluginId, PluginStatus.INSTALLED);

      await this.eventBus.emit('plugin.installed', { pluginId, context });
      this.logger.log(`Plugin ${pluginId} installed successfully`);
    } catch (error) {
      this.logger.error(`Failed to install plugin ${pluginId}: ${error.message}`);
      this.pluginStatus.set(pluginId, PluginStatus.ERROR);
      throw error;
    }
  }

  async uninstallPlugin(pluginId: string, context: PluginContext): Promise<void> {
    try {
      this.logger.log(`Uninstalling plugin: ${pluginId}`);

      const plugin = await this.registry.getPlugin(pluginId);
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginId}`);
      }

      // 先禁用插件
      await this.disablePlugin(pluginId, context);

      // 执行卸载生命周期
      await this.lifecycleManager.uninstallPlugin(plugin, context);

      // 从注册表中移除
      await this.registry.unregister(pluginId);

      // 清理状态
      this.plugins.delete(pluginId);
      this.pluginStatus.delete(pluginId);

      await this.eventBus.emit('plugin.uninstalled', { pluginId, context });
      this.logger.log(`Plugin ${pluginId} uninstalled successfully`);
    } catch (error) {
      this.logger.error(`Failed to uninstall plugin ${pluginId}: ${error.message}`);
      this.pluginStatus.set(pluginId, PluginStatus.ERROR);
      throw error;
    }
  }

  async enablePlugin(pluginId: string, context?: PluginContext): Promise<void> {
    try {
      const plugin = await this.registry.getPlugin(pluginId);
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginId}`);
      }

      await this.lifecycleManager.enablePlugin(plugin, context || {});
      await this.eventBus.emit('plugin.enabled', { pluginId });

      this.logger.log(`Plugin ${pluginId} enabled successfully`);
    } catch (error) {
      this.logger.error(`Failed to enable plugin ${pluginId}:`, error);
      throw error;
    }
  }

  async disablePlugin(pluginId: string, context?: PluginContext): Promise<void> {
    try {
      const plugin = await this.registry.getPlugin(pluginId);
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginId}`);
      }

      await this.lifecycleManager.disablePlugin(plugin, context || {});
      await this.eventBus.emit('plugin.disabled', { pluginId });

      this.logger.log(`Plugin ${pluginId} disabled successfully`);
    } catch (error) {
      this.logger.error(`Failed to disable plugin ${pluginId}:`, error);
      throw error;
    }
  }

  async upgradePlugin(pluginId: string, context: PluginContext, fromVersion: string): Promise<void> {
    try {
      this.logger.log(`Upgrading plugin: ${pluginId} from version ${fromVersion}`);

      const plugin = await this.registry.getPlugin(pluginId);
      if (!plugin) {
        throw new Error(`Plugin not found: ${pluginId}`);
      }

      await this.lifecycleManager.upgradePlugin(plugin, context, fromVersion);

      this.logger.log(`Plugin ${pluginId} upgraded successfully`);
    } catch (error) {
      this.logger.error(`Failed to upgrade plugin ${pluginId}: ${error.message}`);
      throw error;
    }
  }

  // 获取插件实例
  getPlugin<T extends ApplicationPlugin>(pluginId: string): T | undefined {
    return this.plugins.get(pluginId) as T;
  }

  // 获取插件状态
  getPluginStatus(pluginId: string): PluginStatus {
    return this.pluginStatus.get(pluginId) || PluginStatus.DISABLED;
  }

  // 获取所有已加载的插件
  getAllPlugins(): ApplicationPlugin[] {
    return Array.from(this.plugins.values());
  }

  private async validatePlugin(plugin: ApplicationPlugin): Promise<void> {
    if (!plugin) {
      throw new Error('Plugin instance is undefined');
    }

    if (!plugin.metadata) {
      throw new Error('Plugin metadata is undefined');
    }

    const { pluginId, type } = plugin.metadata;
    if (!pluginId || !type) {
      throw new Error(`Invalid plugin metadata: pluginId=${pluginId}, type=${type}`);
    }

    // 验证必需的方法
    const requiredMethods = ['onEnable', 'onDisable'];
    for (const method of requiredMethods) {
      if (typeof plugin[method] !== 'function') {
        throw new Error(`Plugin ${pluginId} is missing required method: ${method}`);
      }
    }
  }

  private async checkDependencies(plugin: ApplicationPlugin): Promise<void> {
    const dependencies = plugin.metadata.dependencies || [];
    for (const depId of dependencies) {
      if (!this.plugins.has(depId)) {
        throw new Error(`Missing dependency: ${depId}`);
      }
    }
  }
}
