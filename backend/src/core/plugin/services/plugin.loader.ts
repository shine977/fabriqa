import { Inject, Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { join } from 'path';
import { promises as fs } from 'fs';
import { ApplicationPlugin } from '../interfaces/plugin.interface';
import { PluginConfig } from '../types/plugin.type';
import { PluginException } from '../exceptions/plugin.exception';

@Injectable()
export class PluginLoader {
  private readonly logger = new Logger(PluginLoader.name);

  constructor(
    private readonly moduleRef: ModuleRef,
    @Inject('PLUGIN_CONFIG') private readonly config: PluginConfig,
  ) {}

  async load(pluginId: string): Promise<ApplicationPlugin | undefined> {
    try {
      // 1. 定位插件文件
      const pluginPath = await this.resolvePluginPath(pluginId);
      // 2. 验证插件文件
      await this.validatePluginFile(pluginPath);

      // 3. 加载插件模块
      const PluginClass = await this.loadPluginModule(pluginPath);

      // 4. 创建插件实例
      const plugin = await this.createPluginInstance(PluginClass);

      // 5. 验证插件实例
      await this.validatePluginInstance(plugin);

      return plugin;
    } catch (error) {
      this.logger.error(`Failed to load plugin ${pluginId}:`, error);
      throw new PluginException('PLUGIN_LOAD_FAILED', error.message);
    }
  }

  private async resolvePluginPath(pluginId: string): Promise<string> {
    try {
      // 定义可能的文件名模式
      const possibleFiles = [
        `${pluginId}.plugin.ts`,
        `${pluginId}.plugin.js`,
        'index.ts',
        'index.js',
        'main.ts',
        'main.js',
        `${pluginId}.ts`,
        `${pluginId}.js`,
      ];

      // 1. 检查 src/plugins 目录
      const srcPluginsPath = join(process.cwd(), 'src', 'plugins', pluginId);
      this.logger.debug(`Checking src/plugins path: ${srcPluginsPath}`);

      // 2. 检查 dist/plugins 目录（编译后的文件）
      const distPluginsPath = join(process.cwd(), 'dist', 'plugins', pluginId);
      this.logger.debug(`Checking dist/plugins path: ${distPluginsPath}`);

      // 检查所有可能的文件（先检查 dist，因为是编译后的文件）
      for (const basePath of [distPluginsPath, srcPluginsPath]) {
        for (const file of possibleFiles) {
          const pluginFile = join(basePath, file);
          this.logger.debug(`Checking plugin file: ${pluginFile}`);
          if (await this.fileExists(pluginFile)) {
            return pluginFile;
          }
        }
      }

      // 3. 检查外部插件目录
      const externalPath = join(process.cwd(), this.config.pluginsDir || 'plugins', pluginId);
      this.logger.debug(`Checking external plugin path: ${externalPath}`);
      if (await this.fileExists(externalPath)) {
        return externalPath;
      }

      // 4. 检查 node_modules
      try {
        const nodeModulesPath = require.resolve(pluginId);
        this.logger.debug(`Found plugin in node_modules: ${nodeModulesPath}`);
        return nodeModulesPath;
      } catch (error) {
        this.logger.debug(`Plugin not found in node_modules: ${error.message}`);
      }

      throw new PluginException(
        'PLUGIN_NOT_FOUND',
        `Plugin ${pluginId} not found in any of these locations:\n` +
          `1. dist/plugins/${pluginId}/[${possibleFiles.join(', ')}]\n` +
          `2. src/plugins/${pluginId}/[${possibleFiles.join(', ')}]\n` +
          `3. ${externalPath}\n` +
          `4. node_modules/${pluginId}`,
      );
    } catch (error) {
      if (error instanceof PluginException) {
        throw error;
      }
      throw new PluginException('PLUGIN_RESOLUTION_FAILED', `Failed to resolve plugin ${pluginId}: ${error.message}`);
    }
  }

  private async validatePluginFile(pluginPath: string): Promise<void> {
    try {
      // 1. 检查文件是否存在
      const stats = await fs.stat(pluginPath);
      if (!stats.isFile() && !stats.isDirectory()) {
        throw new PluginException('INVALID_PLUGIN_PATH', pluginPath);
      }

      // 2. 检查 package.json（如果是目录）
      if (stats.isDirectory()) {
        const packagePath = join(pluginPath, 'package.json');
        await fs.access(packagePath);
      }

      // 3. 检查文件权限
      await fs.access(pluginPath, fs.constants.R_OK);
    } catch (error) {
      throw new PluginException('PLUGIN_FILE_VALIDATION_FAILED', error.message);
    }
  }

  private async loadPluginModule(pluginPath: string): Promise<any> {
    try {
      // 清除之前的缓存
      this.clearRequireCache(pluginPath);

      // 加载模块
      const module = await import(pluginPath);

      // 处理不同的导出方式
      let PluginClass;

      // 1. 如果是默认导出
      if (module.default) {
        PluginClass = module.default;
      } else {
        const exportedClass = Object.values(module)[0];
        if (exportedClass && typeof exportedClass === 'function') {
          PluginClass = exportedClass;
        }
      }

      if (!PluginClass) {
        throw new Error(`Plugin module does not export a class: ${pluginPath}`);
      }

      return PluginClass;
    } catch (error) {
      throw new PluginException('PLUGIN_LOAD_FAILED', error.message);
    }
  }

  private async createPluginInstance(PluginClass: any): Promise<ApplicationPlugin> {
    try {
      let instance: ApplicationPlugin;
      const paramTypes = Reflect.getMetadata('design:paramtypes', PluginClass) || [];
      const injectTokens = Reflect.getMetadata('inject', PluginClass) || [];
      const params = await Promise.all(
        paramTypes.map(async (type: any, index: number) => {
          // 优先使用 @Inject() 装饰器指定的 token
          const token = injectTokens[index] || type;
          try {
            return await this.moduleRef.get(token, { strict: false });
          } catch (error) {
            this.logger.warn(`Failed to resolve dependency ${token.toString()}:`, error);
            return undefined;
          }
        }),
      );
      // 如果是类，直接 new 实例化
      if (typeof PluginClass === 'function') {
        instance = new PluginClass(...params);
      }
      // 如果是对象（已实例化的插件），直接使用
      else if (typeof PluginClass === 'object' && PluginClass !== null) {
        instance = PluginClass;
      } else {
        throw new Error(`Invalid plugin type: ${typeof PluginClass}`);
      }

      return instance;
    } catch (error) {
      throw new PluginException('PLUGIN_INSTANTIATION_FAILED', error.message);
    }
  }

  private async validatePluginInstance(plugin: ApplicationPlugin): Promise<void> {
    if (!plugin) {
      throw new PluginException('PLUGIN_INSTANCE_UNDEFINED');
    }

    // 1. 验证元数据
    if (!plugin.metadata) {
      throw new PluginException('PLUGIN_METADATA_UNDEFINED');
    }

    const { pluginId, name, version } = plugin.metadata;
    if (!pluginId || !name || !version) {
      throw new PluginException('INVALID_PLUGIN_METADATA');
    }

    // 2. 验证必需的方法
    const requiredMethods = ['onEnable', 'onDisable'];
    for (const method of requiredMethods) {
      if (typeof plugin[method] !== 'function') {
        throw new PluginException('MISSING_REQUIRED_METHOD', method);
      }
    }
  }

  private findPropertyKeyForType(instance: any, type: any): string | undefined {
    const prototype = Object.getPrototypeOf(instance);
    const properties = Object.getOwnPropertyNames(prototype);

    for (const prop of properties) {
      const metadata = Reflect.getMetadata('design:type', prototype, prop);
      if (metadata === type) {
        return prop;
      }
    }

    return undefined;
  }

  private clearRequireCache(modulePath: string): void {
    const resolvedPath = require.resolve(modulePath);
    delete require.cache[resolvedPath];
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      const stat = await fs.stat(path);
      return stat.isFile() || stat.isDirectory();
    } catch (error) {
      return false;
    }
  }
}
