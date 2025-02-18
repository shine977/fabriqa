import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApplicationPlugin, PluginContext } from '../interfaces/plugin.interface';
import { PluginException } from '../exceptions/plugin.exception';

@Injectable()
export class PluginLifecycleManager {
  private readonly logger = new Logger(PluginLifecycleManager.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async installPlugin(plugin: ApplicationPlugin, context: PluginContext): Promise<void> {
    try {
      // 1. 发出安装开始事件
      await this.emitLifecycleEvent('installing', plugin, context);

      // 2. 执行安装生命周期方法
      if (typeof plugin.onInstall == 'function') {
        await plugin.onInstall(context);
      }

      // 3. 发出安装完成事件
      await this.emitLifecycleEvent('installed', plugin, context);
    } catch (error) {
      await this.handleLifecycleError('install', plugin, error, context);
      throw error;
    }
  }

  async enablePlugin(plugin: ApplicationPlugin, context: PluginContext): Promise<void> {
    try {
      // 1. 发出启用开始事件
      await this.emitLifecycleEvent('enabling', plugin, context);

      // 2. 执行初始化（如果存在）
      if (typeof plugin.onInit === 'function') {
        await plugin.onInit(context);
      }

      // 3. 执行启用生命周期方法
      await plugin.onEnable(context);

      // 4. 发出启用完成事件
      await this.emitLifecycleEvent('enabled', plugin, context);
    } catch (error) {
      await this.handleLifecycleError('enable', plugin, error, context);
      throw error;
    }
  }

  async disablePlugin(plugin: ApplicationPlugin, context: PluginContext): Promise<void> {
    try {
      // 1. 发出禁用开始事件
      await this.emitLifecycleEvent('disabling', plugin, context);

      // 2. 执行禁用生命周期方法
      await plugin.onDisable(context);

      // 3. 发出禁用完成事件
      await this.emitLifecycleEvent('disabled', plugin, context);
    } catch (error) {
      await this.handleLifecycleError('disable', plugin, error, context);
      throw error;
    }
  }

  async uninstallPlugin(plugin: ApplicationPlugin, context: PluginContext): Promise<void> {
    try {
      // 1. 发出卸载开始事件
      await this.emitLifecycleEvent('uninstalling', plugin, context);

      // 2. 执行卸载生命周期方法
      if (typeof plugin.onUninstall === 'function') {
        await plugin.onUninstall(context);
      }

      // 3. 发出卸载完成事件
      await this.emitLifecycleEvent('uninstalled', plugin, context);
    } catch (error) {
      await this.handleLifecycleError('uninstall', plugin, error, context);
      throw error;
    }
  }

  async handleError(plugin: ApplicationPlugin, context: PluginContext, error: Error): Promise<void> {
    try {
      // 1. 发出错误处理开始事件
      await this.emitLifecycleEvent('error', plugin, context);

      // 2. 执行错误处理生命周期方法
      if (typeof plugin.onError === 'function') {
        await plugin.onError(context, error);
      }
      await this.emitLifecycleEvent('error', plugin, { ...context, error });
    } catch (error) {
      this.logger.error(`Error handling error for plugin ${plugin.metadata.pluginId}:`, error);
    }
  }

  private async emitLifecycleEvent(event: string, plugin: ApplicationPlugin, context: PluginContext): Promise<void> {
    const eventName = `plugin.lifecycle.${event}`;
    const eventData = {
      pluginId: plugin.metadata.pluginId,
      pluginName: plugin.metadata.name,
      context,
      timestamp: new Date(),
    };

    await this.eventEmitter.emit(eventName, eventData);
  }

  private async handleLifecycleError(
    operation: string,
    plugin: ApplicationPlugin,
    error: Error,
    context: PluginContext,
  ): Promise<void> {
    const errorContext = {
      ...context,
      error,
      operation,
      timestamp: new Date(),
    };

    this.logger.error(`Plugin ${plugin.metadata.pluginId} ${operation} failed:`, error);

    await this.handleError(plugin, errorContext, error);
    throw new PluginException(`PLUGIN_${operation.toUpperCase()}_FAILED`, error.message);
  }
}
