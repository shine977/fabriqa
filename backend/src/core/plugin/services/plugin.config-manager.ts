import { Injectable, Logger } from '@nestjs/common';
import { ApplicationPlugin } from '../interfaces/plugin.interface';

@Injectable()
export class PluginConfigManager {
  private readonly logger = new Logger(PluginConfigManager.name);
  private readonly configStore = new Map<string, Record<string, any>>();

  async loadConfig(plugin: ApplicationPlugin): Promise<Record<string, any>> {
    try {
      const pluginId = plugin.metadata.pluginId;
      const config = this.configStore.get(pluginId) || {};

      // 如果插件定义了配置模式，进行验证
      if (plugin.metadata.configSchema) {
        await this.validateConfig(plugin, config);
      }

      return config;
    } catch (error) {
      this.logger.error(`Error loading config for plugin ${plugin.metadata.pluginId}: ${error.message}`);
      throw error;
    }
  }

  async saveConfig(plugin: ApplicationPlugin, config: Record<string, any>): Promise<void> {
    try {
      const pluginId = plugin.metadata.pluginId;

      // 验证配置
      await this.validateConfig(plugin, config);

      // 保存配置
      this.configStore.set(pluginId, config);

      this.logger.debug(`Saved config for plugin ${pluginId}`);
    } catch (error) {
      this.logger.error(`Error saving config for plugin ${plugin.metadata.pluginId}: ${error.message}`);
      throw error;
    }
  }

  async validateConfig(plugin: ApplicationPlugin, config: Record<string, any>): Promise<boolean> {
    try {
      // 如果插件实现了自定义验证方法，使用它
      if (typeof plugin.validateConfig === 'function') {
        return await plugin.validateConfig(config);
      }

      // 如果插件定义了配置模式，使用它进行验证
      if (plugin.metadata.configSchema) {
        // TODO: 实现配置模式验证
        // 可以使用 JSON Schema 或其他验证库
      }

      return true;
    } catch (error) {
      this.logger.error(`Error validating config for plugin ${plugin.metadata.pluginId}: ${error.message}`);
      throw error;
    }
  }

  async getConfig(plugin: ApplicationPlugin): Promise<Record<string, any>> {
    try {
      const pluginId = plugin.metadata.pluginId;

      // 如果插件实现了自定义获取配置方法，使用它
      if (typeof plugin.getConfig === 'function') {
        return await plugin.getConfig();
      }

      return this.configStore.get(pluginId) || {};
    } catch (error) {
      this.logger.error(`Error getting config for plugin ${plugin.metadata.pluginId}: ${error.message}`);
      throw error;
    }
  }

  async updateConfig(plugin: ApplicationPlugin, partialConfig: Record<string, any>): Promise<void> {
    try {
      const pluginId = plugin.metadata.pluginId;
      const currentConfig = await this.getConfig(plugin);
      const newConfig = { ...currentConfig, ...partialConfig };

      await this.saveConfig(plugin, newConfig);
    } catch (error) {
      this.logger.error(`Error updating config for plugin ${plugin.metadata.pluginId}: ${error.message}`);
      throw error;
    }
  }

  async deleteConfig(plugin: ApplicationPlugin): Promise<void> {
    try {
      const pluginId = plugin.metadata.pluginId;
      this.configStore.delete(pluginId);
      this.logger.debug(`Deleted config for plugin ${pluginId}`);
    } catch (error) {
      this.logger.error(`Error deleting config for plugin ${plugin.metadata.pluginId}: ${error.message}`);
      throw error;
    }
  }
}
