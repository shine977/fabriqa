// src/core/plugin/services/plugin.registry.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationPlugin, PluginContext, PluginLifecycle, PluginState } from '../interfaces/plugin.interface';

import { PluginEventBus } from './plugin.event-bus';
import { PluginStatus } from '../types/plugin.type';
import { PluginEntity } from '../entities/plugin.entity';

@Injectable()
export class PluginRegistry {
  private readonly logger = new Logger(PluginRegistry.name);
  private readonly registry = new Map<string, ApplicationPlugin>();

  constructor(
    @InjectRepository(PluginEntity)
    private readonly pluginRepository: Repository<PluginEntity>,
    private readonly eventBus: PluginEventBus,
  ) {}

  async register(plugin: ApplicationPlugin): Promise<void> {
    const { pluginId } = plugin.metadata;
    const context: PluginContext = {
      state: PluginState.INSTALLED,
      config: plugin.getConfig(),
    };

    try {
      // 1. 检查是否已注册
      if (this.registry.has(pluginId)) {
        this.logger.warn(`Plugin ${pluginId} is already registered`);
        return;
      }

      // 2. 执行注册前钩子
      if ('onBeforeRegister' in plugin) {
        await (plugin as unknown as PluginLifecycle).onBeforeRegister?.(context);
      }

      // 3. 保存到数据库
      await this.savePluginMetadata(plugin);

      // 4. 执行注册时钩子
      if ('onRegister' in plugin) {
        await (plugin as unknown as PluginLifecycle).onRegister?.(context);
      }

      // 5. 添加到内存注册表
      this.registry.set(pluginId, plugin);

      // 6. 执行注册后钩子
      if ('onAfterRegister' in plugin) {
        await (plugin as unknown as PluginLifecycle).onAfterRegister?.(context);
      }

      // 7. 发出注册事件
      await this.eventBus.emit('registered', {
        pluginId: pluginId,
        metadata: plugin.metadata,
      });

      this.logger.log(`Plugin ${pluginId} registered successfully`);
    } catch (error) {
      this.logger.error(`Failed to register plugin ${pluginId}:`, error);
      // 注册失败时，确保清理任何部分完成的注册
      this.registry.delete(pluginId);
      throw error;
    }
  }

  async unregister(pluginId: string): Promise<void> {
    try {
      // 从注册表中移除
      this.registry.delete(pluginId);

      // 更新数据库状态
      await this.pluginRepository.update({ pluginId }, { status: PluginStatus.DISABLED });

      // 发出注销事件
      await this.eventBus.emit('unregistered', { pluginId });

      this.logger.log(`Plugin ${pluginId} unregistered successfully`);
    } catch (error) {
      this.logger.error(`Failed to unregister plugin ${pluginId}:`, error);
      throw error;
    }
  }

  private async savePluginMetadata(plugin: ApplicationPlugin): Promise<void> {
    const { pluginId, name, version, type, description, author, dependencies } = plugin.metadata;

    const entity = await this.pluginRepository.findOne({ where: { pluginId } });
    console.log('entity', pluginId);

    if (entity) {
      // 更新现有记录
      await this.pluginRepository.update(
        { pluginId },
        {
          name,
          version,
          type,
          description,
          author,
          dependencies,
          status: PluginStatus.INSTALLED,
        },
      );
    } else {
      // 创建新记录
      await this.pluginRepository.save({
        pluginId,
        name,
        version,
        type,
        description,
        author,
        dependencies,
        status: PluginStatus.INSTALLED,
      });
    }
    this.logger.log(`Saved or updated metadata for plugin ${pluginId}`);
  }

  getPlugin(pluginId: string): ApplicationPlugin | undefined {
    return this.registry.get(pluginId);
  }

  async listPlugins(): Promise<ApplicationPlugin[]> {
    try {
      // 返回内存中的所有插件
      return Array.from(this.registry.values());
    } catch (error) {
      this.logger.error(`Failed to list plugins: ${error.message}`);
      throw error;
    }
  }

  async getPluginMetadata(pluginId: string): Promise<PluginEntity | undefined> {
    return this.pluginRepository.findOne({
      where: { pluginId },
    });
  }

  async getAllPluginMetadata(): Promise<PluginEntity[]> {
    return this.pluginRepository.find();
  }

  hasPlugin(pluginId: string): boolean {
    return this.registry.has(pluginId);
  }
}
