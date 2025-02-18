import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PluginType, PluginStatus, PluginConfig } from '../types/plugin.type';
import { PluginEntity } from '../entities/plugin.entity';
import { PluginRegistry } from './plugin.registry';
import { PluginLoader } from './plugin.loader';
import { PluginLifecycleManager } from './plugin.lifecycle-manager';
import { PluginDependencyResolver } from './plugin.dependency-resolver';
import { ApplicationPlugin, PluginContext } from '../interfaces/plugin.interface';

import { PluginException } from '../exceptions/plugin.exception';
import { Mutex } from '../utils/mutex.util';
import { retry } from '../utils/retry.util';

@Injectable()
export class PluginManager implements OnModuleInit {
  private readonly logger = new Logger(PluginManager.name);
  private readonly plugins = new Map<string, ApplicationPlugin>();
  private readonly mutex = new Mutex();
  private initialized = false;

  constructor(
    @InjectRepository(PluginEntity)
    private readonly pluginRepository: Repository<PluginEntity>,
    @Inject('PLUGIN_CONFIG')
    private readonly config: PluginConfig,
    private readonly loader: PluginLoader,
    private readonly registry: PluginRegistry,
    private readonly lifecycleManager: PluginLifecycleManager,
    private readonly dependencyResolver: PluginDependencyResolver,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    if (this.initialized) return;

    try {
      await this.initializePluginSystem();
    } catch (error) {
      this.logger.error('Failed to initialize plugin system:', error);
      throw error;
    }
  }

  private async initializePluginSystem() {
    try {
      // 1. 加载系统插件
      await this.loadSystemPlugins();

      // 2. 加载已安装的插件
      await this.loadInstalledPlugins();

      // 3. 标记初始化完成
      this.initialized = true;

      // 4. 发出初始化完成事件
      await this.eventEmitter.emit('plugin.system.initialized');

      this.logger.log('Plugin system initialized successfully');
    } finally {
      this.mutex.release();
    }
  }

  private async loadSystemPlugins() {
    if (!this.config.systemPlugins?.length) return;

    this.logger.log('Loading system plugins...');

    for (const pluginId of this.config.systemPlugins) {
      try {
        await retry(() => this.installPlugin(pluginId), this.config.maxRetries || 3, this.config.retryDelay || 1000);
      } catch (error) {
        this.logger.error(`Failed to load system plugin ${pluginId}:`, error);
        // 系统插件加载失败是致命错误
        throw new PluginException('SYSTEM_PLUGIN_LOAD_FAILED', pluginId);
      }
    }
  }

  private async loadInstalledPlugins() {
    const installedPlugins = await this.pluginRepository.find({
      // where: { status: PluginStatus.ENABLED },
      order: {
        type: 'ASC', // 首先按类型排序，确保系统插件先加载
        createdAt: 'ASC', // 然后按安装时间排序
      },
    });
    this.logger.log(`Loading ${installedPlugins.length} installed plugins...`);

    for (const plugin of installedPlugins) {
      try {
        await retry(
          () => this.enablePlugin(plugin.pluginId),
          this.config.maxRetries || 3,
          this.config.retryDelay || 1000,
        );
      } catch (error) {
        this.logger.error(`Failed to load plugin ${plugin.pluginId}:`, error);
        await this.handlePluginException(plugin.pluginId, error);
      }
    }
  }

  async installPlugin(pluginId: string, context?: PluginContext): Promise<void> {
    try {
      this.logger.log(`Installing plugin: ${pluginId}`);
      await this.mutex.acquire();
      console.log('installPlugin after acquire ~~~~~~', pluginId);
      // 1. 先加载插件以获取元数据
      const plugin = await this.loader.load(pluginId);
      if (!plugin) {
        throw new PluginException('PLUGIN_LOAD_FAILED', pluginId);
      }

      // 2. 检查插件是否已安装（通过 pluginId 或 name）
      const existingPlugin = await this.pluginRepository.findOne({
        where: [{ pluginId }, { name: plugin.metadata.name }],
      });

      if (this.plugins.has(pluginId) || existingPlugin) {
        this.logger.log(`Plugin ${pluginId} already exists, updating...`);

        // 如果插件已存在，更新它
        if (existingPlugin) {
          await this.pluginRepository.update(
            { pluginId: existingPlugin.pluginId },
            {
              version: plugin.metadata.version,
              description: plugin.metadata.description,
              author: plugin.metadata.author,
              dependencies: plugin.metadata.dependencies,
              status: PluginStatus.INSTALLED,
            },
          );
        }

        // 更新内存中的插件
        this.plugins.set(pluginId, plugin);
        await this.lifecycleManager.installPlugin(plugin, context || {});
        console.log('installPlugin~~~~~~ this.plugins');
        return;
      }

      // 3. 更新状态为安装中
      await this.updatePluginStatus(pluginId, PluginStatus.INSTALLING);

      // 4. 开启数据库事务
      await this.dataSource.transaction(async manager => {
        // 4.1 验证插件
        await this.validatePlugin(plugin);

        // 4.2 解析并检查依赖
        await this.dependencyResolver.resolveDependencies([plugin]);

        // 4.3 执行安装生命周期
        await this.lifecycleManager.installPlugin(plugin, context || {});

        // 4.4 注册到系统
        await this.registry.register(plugin);
        this.plugins.set(pluginId, plugin);

        // 4.5 保存到数据库
        const newEntity = manager.create(PluginEntity, {
          pluginId,
          name: plugin.metadata.name,
          version: plugin.metadata.version,
          type: plugin.metadata.type,
          description: plugin.metadata.description,
          author: plugin.metadata.author,
          dependencies: plugin.metadata.dependencies,
          status: PluginStatus.INSTALLED,
        });
        await manager.save(newEntity);
      });

      this.logger.log(`Plugin ${pluginId} installed successfully`);
    } catch (error) {
      this.logger.error(`Failed to install plugin ${pluginId}:`, error);
      await this.handlePluginException(pluginId, error);
      throw error;
    } finally {
      await this.mutex.release();
    }
  }

  async enablePlugin(pluginId: string, context?: PluginContext): Promise<void> {
    await this.mutex.acquire();

    try {
      this.logger.log(`Enabling plugin: ${pluginId}`);

      // 1. 获取插件实例
      const plugin = this.plugins.get(pluginId);
      if (!plugin) throw new PluginException('PLUGIN_NOT_FOUND', pluginId);

      // 2. 更新状态为启用中
      await this.updatePluginStatus(pluginId, PluginStatus.ENABLING);

      // 3. 执行启用生命周期
      await this.lifecycleManager.enablePlugin(plugin, context || {});

      // 4. 更新状态为已启用
      await this.updatePluginStatus(pluginId, PluginStatus.ENABLED);

      this.logger.log(`Plugin ${pluginId} enabled successfully`);
    } catch (error) {
      this.logger.error(`Failed to enable plugin ${pluginId}:`, error);
      await this.handlePluginException(pluginId, error);
      throw error;
    } finally {
      this.mutex.release();
    }
  }

  async disablePlugin(pluginId: string, context?: PluginContext): Promise<void> {
    await this.mutex.acquire();

    try {
      this.logger.log(`Disabling plugin: ${pluginId}`);

      // 1. 获取插件实例
      const plugin = this.plugins.get(pluginId);
      if (!plugin) throw new PluginException('PLUGIN_NOT_FOUND', pluginId);

      // 2. 检查是否可以禁用
      if (plugin.metadata.type === PluginType.SYSTEM) {
        throw new PluginException('SYSTEM_PLUGIN_CANNOT_BE_DISABLED', pluginId);
      }

      // 3. 更新状态为禁用中
      await this.updatePluginStatus(pluginId, PluginStatus.DISABLING);

      // 4. 执行禁用生命周期
      await this.lifecycleManager.disablePlugin(plugin, context || {});

      // 5. 更新状态为已禁用
      await this.updatePluginStatus(pluginId, PluginStatus.DISABLED);

      this.logger.log(`Plugin ${pluginId} disabled successfully`);
    } catch (error) {
      this.logger.error(`Failed to disable plugin ${pluginId}:`, error);
      await this.handlePluginException(pluginId, error);
      throw error;
    } finally {
      this.mutex.release();
    }
  }

  async uninstallPlugin(pluginId: string, context?: PluginContext): Promise<void> {
    await this.mutex.acquire();
    try {
      this.logger.log(`Uninstalling plugin: ${pluginId}`);

      // 1. 获取插件实例
      const plugin = this.plugins.get(pluginId);
      if (!plugin) throw new PluginException('PLUGIN_NOT_FOUND', pluginId);

      // 2. 检查是否可以卸载
      if (plugin.metadata.type === PluginType.SYSTEM) {
        throw new PluginException('SYSTEM_PLUGIN_CANNOT_BE_UNINSTALLED', pluginId);
      }

      // 3. 检查依赖关系
      await this.checkDependents(pluginId);

      // 4. 更新状态为卸载中
      await this.updatePluginStatus(pluginId, PluginStatus.UNINSTALLING);

      // 5. 开启数据库事务
      await this.dataSource.transaction(async manager => {
        // 5.1 先禁用插件
        await this.disablePlugin(pluginId, context);

        // 5.2 执行卸载生命周期
        await this.lifecycleManager.uninstallPlugin(plugin, context || {});

        // 5.3 从注册表中移除
        await this.registry.unregister(pluginId);

        // 5.4 从数据库中删除
        await manager.delete(PluginEntity, pluginId);
      });

      // 6. 清理内存中的实例
      this.plugins.delete(pluginId);

      this.logger.log(`Plugin ${pluginId} uninstalled successfully`);
    } catch (error) {
      this.logger.error(`Failed to uninstall plugin ${pluginId}:`, error);
      await this.handlePluginException(pluginId, error);
      throw error;
    } finally {
      this.mutex.release();
    }
  }

  private async validatePlugin(plugin: ApplicationPlugin): Promise<void> {
    if (!plugin) throw new PluginException('PLUGIN_INSTANCE_UNDEFINED');
    if (!plugin.metadata) throw new PluginException('PLUGIN_METADATA_UNDEFINED');

    const { pluginId, type, version } = plugin.metadata;
    if (!pluginId || !type || !version) {
      throw new PluginException('INVALID_PLUGIN_METADATA', JSON.stringify(plugin.metadata));
    }

    // 验证必需的方法
    const requiredMethods = ['onEnable', 'onDisable'];
    for (const method of requiredMethods) {
      if (typeof plugin[method] !== 'function') {
        throw new PluginException('MISSING_REQUIRED_METHOD', `${pluginId}:${method}`);
      }
    }
  }

  private async checkDependents(pluginId: string): Promise<void> {
    const dependents = await this.dependencyResolver.findDependents(pluginId);
    if (dependents.length > 0) {
      throw new PluginException('PLUGIN_HAS_DEPENDENTS', `Plugin ${pluginId} is required by: ${dependents.join(', ')}`);
    }
  }

  private async updatePluginStatus(pluginId: string, status: PluginStatus): Promise<void> {
    try {
      await this.pluginRepository
        .createQueryBuilder()
        .update()
        .set({ status, updatedAt: new Date() })
        .where('pluginId = :pluginId', { pluginId })
        .execute();
      await this.eventEmitter.emit('plugin.status.changed', {
        pluginId,
        status,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to update plugin status: ${error.message}`);
      throw error;
    }
  }

  private async handlePluginException(pluginId: string, error: Error): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      try {
        const context = {
          error,
          timestamp: new Date(),
        };

        await this.lifecycleManager.handleError(plugin, context, error);
        await this.updatePluginStatus(pluginId, PluginStatus.ERROR);

        await this.eventEmitter.emit('plugin.error', {
          pluginId,
          error: error.message,
          stack: error.stack,
          timestamp: new Date(),
        });
      } catch (handlerError) {
        this.logger.error(`Error handling error for plugin ${pluginId}:`, handlerError);
      }
    }
  }

  // 公共 API
  async getPlugin(pluginId: string): Promise<ApplicationPlugin | undefined> {
    return this.plugins.get(pluginId);
  }

  async getPluginInfo(pluginId: string): Promise<PluginEntity | undefined> {
    return this.pluginRepository.findOne({ where: { pluginId } });
  }

  async getAllPlugins(): Promise<ApplicationPlugin[]> {
    return Array.from(this.plugins.values());
  }

  async getAllPluginInfos(): Promise<PluginEntity[]> {
    return this.pluginRepository.find();
  }
}
