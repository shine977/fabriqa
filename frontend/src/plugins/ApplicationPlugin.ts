/**
 * Plugin System
 *
 * 提供一个简单但功能强大的插件系统，允许注册插件和执行钩子
 */

import React, { createContext, useContext } from 'react';
import { Plugin } from '../types';

// 插件系统实现
export class ApplicationPlugin {
  private plugins: Map<string, Plugin> = new Map();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private hooks: Map<string, Map<string, Function[]>> = new Map();

  /**
   * 注册一个新插件
   *
   * @param plugin 要注册的插件
   */
  registerPlugin(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin with id ${plugin.id} is already registered. Skipping.`);
      return;
    }

    // 注册插件
    this.plugins.set(plugin.id, plugin);

    // 如果插件提供了钩子，注册它们
    if (plugin.hooks) {
      Object.entries(plugin.hooks).forEach(([hookName, handler]) => {
        this.addHook(plugin.id, hookName, handler);
      });
    }

    console.log(`Plugin ${plugin.name} (${plugin.id}) registered successfully`);
  }

  /**
   * 向后兼容方法 - 注册钩子
   */
  registerHook(pluginId: string, hookName: string, handler: Function): void {
    this.addHook(pluginId, hookName, handler);
  }

  /**
   * 添加钩子
   *
   * @param pluginId 插件ID
   * @param hookName 钩子名称
   * @param handler 处理函数
   */
  addHook(pluginId: string, hookName: string, handler: Function): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, new Map());
    }

    const hookMap = this.hooks.get(hookName)!;

    if (!hookMap.has(pluginId)) {
      hookMap.set(pluginId, []);
    }

    hookMap.get(pluginId)!.push(handler);
    console.log(`Hook ${hookName} added for plugin ${pluginId}`);
  }

  /**
   * 注销一个插件
   *
   * @param pluginId 插件ID
   */
  unregisterPlugin(pluginId: string): void {
    if (!this.plugins.has(pluginId)) {
      console.warn(`Plugin with id ${pluginId} is not registered. Cannot unregister.`);
      return;
    }

    // 移除插件
    this.plugins.delete(pluginId);

    // 移除插件的所有钩子
    this.hooks.forEach(hookMap => {
      if (hookMap.has(pluginId)) {
        hookMap.delete(pluginId);
      }
    });

    console.log(`Plugin ${pluginId} unregistered successfully`);
  }

  /**
   * 获取一个插件
   *
   * @param pluginId 插件ID
   * @returns 插件实例或undefined
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * 获取所有注册的插件
   *
   * @returns 插件列表
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).sort((a, b) => {
      // 按优先级排序（如果有的话）
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      return priorityB - priorityA; // 高优先级在前
    });
  }

  /**
   * 应用钩子并返回结果
   *
   * @param hookName 钩子名称
   * @param defaultValue 默认值
   * @param args 额外参数
   * @returns 处理后的值
   */
  applyHooks<T>(hookName: string, defaultValue: T, ...args: any[]): T {
    if (!this.hooks.has(hookName)) {
      return defaultValue;
    }

    let result = defaultValue;
    const hookMap = this.hooks.get(hookName)!;

    // 按照插件优先级执行钩子
    const sortedPlugins = this.getPlugins();

    for (const plugin of sortedPlugins) {
      const handlers = hookMap.get(plugin.id);
      if (handlers) {
        for (const handler of handlers) {
          result = handler(result, ...args) as T;
        }
      }
    }

    return result;
  }
}

// 创建插件系统实例
export const appPlugin = new ApplicationPlugin();

// 创建一个工具函数来注册多个插件
export const registerPlugins = (plugins: Plugin[]): void => {
  plugins.forEach(plugin => appPlugin.registerPlugin(plugin));
};

// 创建React上下文
const ApplicationPluginContext = createContext<ApplicationPlugin>(appPlugin);

// 创建提供者组件
export const ApplicationPluginProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(ApplicationPluginContext.Provider, { value: appPlugin }, children);
};

// 创建一个钩子，用于在React组件中使用插件系统
export const useAppPlugin = () => useContext(ApplicationPluginContext);

// 创建一个高阶组件，用于在React组件中注入插件系统
export const withAppPlugin = <P extends object>(Component: React.ComponentType<P>): React.FC<P> => {
  return (props: P) => {
    // 使用React.createElement解决JSX展开运算符的问题
    let component = appPlugin.applyHooks<React.ReactNode>(
      'component:beforeRender',
      React.createElement(Component, props),
      props
    );

    // 应用afterRender钩子
    component = appPlugin.applyHooks<React.ReactNode>('component:afterRender', component, props);

    return React.createElement(React.Fragment, null, component);
  };
};

export default appPlugin;
