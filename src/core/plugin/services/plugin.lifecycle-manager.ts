import { Injectable, Logger } from '@nestjs/common';
import { ApplicationPlugin, PluginContext, PluginState } from '../interfaces/plugin.interface';
import { PluginEventBus } from './plugin.event-bus';
import { PluginConfigManager } from './plugin.config-manager';

@Injectable()
export class PluginLifecycleManager {
  private readonly logger = new Logger(PluginLifecycleManager.name);

  // 生命周期方法和对应的状态映射
  private readonly lifecycleStateMap = new Map<string, PluginState>([
    ['onLoad', PluginState.LOADING],
    ['onInit', PluginState.INITIALIZED],
    ['onBeforeInstall', PluginState.INSTALLING],
    ['onInstall', PluginState.INSTALLED],
    ['onBeforeEnable', PluginState.ENABLING],
    ['onEnable', PluginState.ENABLED],
    ['onBeforeDisable', PluginState.DISABLING],
    ['onDisable', PluginState.DISABLED],
    ['onBeforeUpgrade', PluginState.UPGRADING],
    ['onUpgrade', PluginState.UPGRADED],
    ['onBeforeUninstall', PluginState.UNINSTALLING],
    ['onUninstall', PluginState.UNINSTALLED],
    ['onBeforeRegister', PluginState.REGISTERING],
    ['onRegister', PluginState.REGISTERED],
  ]);

  private readonly lifecycleMethods = Array.from(this.lifecycleStateMap.keys()).concat([
    'onAfterInstall',
    'onAfterEnable',
    'onAfterDisable',
    'onAfterUpgrade',
    'onAfterUninstall',
    'onAfterRegister',
    'onError',
  ]);

  constructor(
    private readonly eventBus: PluginEventBus,
    private readonly configManager: PluginConfigManager,
  ) {}

  private async executeLifecycleMethod(
    plugin: ApplicationPlugin,
    method: string,
    context: PluginContext,
    ...args: any[]
  ): Promise<void> {
    try {
      // 更新插件状态
      const newState = this.lifecycleStateMap.get(method);
      if (newState) {
        context.state = newState;
        await this.eventBus.emit('plugin.state.change', {
          pluginId: plugin.metadata.pluginId,
          oldState: context.state,
          newState,
        });
      }
      if (typeof plugin[method] === 'function') {
        this.logger.debug(`Executing ${method} for plugin ${plugin.metadata.pluginId}`);
        await plugin[method](context, ...args);
        await this.eventBus.emit(`plugin.lifecycle.${method}`, {
          pluginId: plugin.metadata.pluginId,
          method,
          success: true,
        });
      }
    } catch (error) {
      this.logger.error(`Error executing ${method} for plugin ${plugin.metadata.pluginId}: ${error.message}`);
      await this.handleError(plugin, context, error);
      throw error;
    }
  }

  private async handleError(plugin: ApplicationPlugin, context: PluginContext, error: Error): Promise<void> {
    try {
      const oldState = context.state;
      context.state = PluginState.ERROR;

      // 发送状态变更事件
      await this.eventBus.emit('plugin.state.change', {
        pluginId: plugin.metadata.pluginId,
        oldState,
        newState: PluginState.ERROR,
        error: error.message,
      });

      if (typeof plugin.onError === 'function') {
        await plugin.onError(context, error);
      }

      await this.eventBus.emit('plugin.error', {
        pluginId: plugin.metadata.pluginId,
        error: error.message,
        state: context.state,
      });
    } catch (handlerError) {
      this.logger.error(`Error handling error for plugin ${plugin.metadata.pluginId}: ${handlerError.message}`);
    }
  }

  async registerPlugin(plugin: ApplicationPlugin, context: PluginContext): Promise<void> {
    await this.executeLifecycleMethod(plugin, 'onBeforeRegister', context);
    await this.executeLifecycleMethod(plugin, 'onRegister', context);
    await this.executeLifecycleMethod(plugin, 'onAfterRegister', context);
  }

  async loadPlugin(plugin: ApplicationPlugin, context: PluginContext): Promise<void> {
    await this.executeLifecycleMethod(plugin, 'onLoad', context);
    await this.executeLifecycleMethod(plugin, 'onInit', context);
  }

  async installPlugin(plugin: ApplicationPlugin, context: PluginContext): Promise<void> {
    await this.executeLifecycleMethod(plugin, 'onBeforeInstall', context);
    await this.executeLifecycleMethod(plugin, 'onInstall', context);
    await this.executeLifecycleMethod(plugin, 'onAfterInstall', context);
  }

  async enablePlugin(plugin: ApplicationPlugin, context: PluginContext): Promise<void> {
    await this.executeLifecycleMethod(plugin, 'onBeforeEnable', context);
    await this.executeLifecycleMethod(plugin, 'onEnable', context);
    await this.executeLifecycleMethod(plugin, 'onAfterEnable', context);
  }

  async disablePlugin(plugin: ApplicationPlugin, context: PluginContext): Promise<void> {
    await this.executeLifecycleMethod(plugin, 'onBeforeDisable', context);
    await this.executeLifecycleMethod(plugin, 'onDisable', context);
    await this.executeLifecycleMethod(plugin, 'onAfterDisable', context);
  }

  async upgradePlugin(plugin: ApplicationPlugin, context: PluginContext, fromVersion: string): Promise<void> {
    await this.executeLifecycleMethod(plugin, 'onBeforeUpgrade', context, fromVersion);
    await this.executeLifecycleMethod(plugin, 'onUpgrade', context, fromVersion);
    await this.executeLifecycleMethod(plugin, 'onAfterUpgrade', context, fromVersion);
  }

  async uninstallPlugin(plugin: ApplicationPlugin, context: PluginContext): Promise<void> {
    await this.executeLifecycleMethod(plugin, 'onBeforeUninstall', context);
    await this.executeLifecycleMethod(plugin, 'onUninstall', context);
    await this.executeLifecycleMethod(plugin, 'onAfterUninstall', context);
  }
}
