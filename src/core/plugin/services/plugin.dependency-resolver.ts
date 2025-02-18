// src/core/plugin/services/plugin.dependency-resolver.ts
import { Injectable, Logger } from '@nestjs/common';
import { ApplicationPlugin } from '../interfaces/plugin.interface';

import { PluginDependencyException } from '../exceptions/plugin.exception';
import { PluginDependencyNode } from '../types/dependency.type';
import { InjectRepository } from '@nestjs/typeorm';
import { PluginEntity } from '../entities/plugin.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PluginDependencyResolver {
  private readonly logger = new Logger(PluginDependencyResolver.name);
  constructor(
    @InjectRepository(PluginEntity)
    private readonly pluginRepository: Repository<PluginEntity>,
  ) {}

  /**
   * 查找依赖于指定插件的其他插件
   * @param pluginId 插件ID
   * @returns 依赖于该插件的插件ID列表
   */
  async findDependents(pluginId: string): Promise<string[]> {
    // 获取所有已安装的插件
    const plugins = await this.pluginRepository.find();

    // 查找依赖于指定插件的其他插件
    return plugins
      .filter(plugin => {
        const dependencies = plugin.dependencies || [];
        return dependencies.includes(pluginId);
      })
      .map(plugin => plugin.pluginId);
  }
  resolveDependencies(plugins: ApplicationPlugin[]): string[] {
    const graph = new Map<string, PluginDependencyNode>();

    // 构建依赖图
    for (const plugin of plugins) {
      graph.set(plugin.metadata.pluginId, {
        pluginId: plugin.metadata.pluginId,
        dependencies: plugin.metadata.dependencies || [],
        visited: false,
        inStack: false,
      });
    }

    const order: string[] = [];

    try {
      // 对每个未访问的节点执行深度优先搜索
      for (const [id, node] of graph) {
        if (!node.visited) {
          this.dfs(id, graph, order);
        }
      }

      return order.reverse();
    } catch (error) {
      this.logger.error('Failed to resolve plugin dependencies:', error);
      throw error;
    }
  }

  validateDependencies(plugin: ApplicationPlugin, availablePlugins: Set<string>): void {
    const dependencies = plugin.metadata.dependencies || [];
    const missingDependencies = dependencies.filter(dep => !availablePlugins.has(dep));

    if (missingDependencies.length > 0) {
      throw new PluginDependencyException(
        plugin.metadata.pluginId,
        `Missing dependencies: ${missingDependencies.join(', ')}`,
      );
    }
  }

  private dfs(currentId: string, graph: Map<string, PluginDependencyNode>, order: string[]): void {
    const node = graph.get(currentId);
    if (!node) {
      throw new Error(`Plugin node not found: ${currentId}`);
    }

    if (node.inStack) {
      throw new PluginDependencyException(currentId, 'Circular dependency detected');
    }

    if (node.visited) {
      return;
    }

    node.inStack = true;
    node.visited = true;

    for (const depId of node.dependencies) {
      if (!graph.has(depId)) {
        throw new PluginDependencyException(currentId, `Dependency not found: ${depId}`);
      }
      this.dfs(depId, graph, order);
    }

    node.inStack = false;
    order.push(currentId);
  }
}
