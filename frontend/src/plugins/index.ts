/**
 * Plugins Index
 *
 * 插件系统入口文件，负责初始化和注册所有插件
 */

import { appPlugin, registerPlugins, ApplicationPluginProvider, useAppPlugin } from './ApplicationPlugin';
import themePlugin from './themePlugin';
import dataTablePlugin from './dataTablePlugin';
import i18nPlugin, { I18nProvider } from './i18nPlugin';
import authPlugin from './authPlugin';

/**
 * 初始化插件系统
 */
export const initializePlugins = (): void => {
  // 注册核心插件
  registerPlugins([
    themePlugin,
    i18nPlugin,
    dataTablePlugin,
    authPlugin,
    // 可在此处添加更多插件
  ]);

  // 初始化插件
  appPlugin.getPlugins().forEach(plugin => {
    if (plugin.initialize) {
      plugin.initialize(appPlugin);
    }
  });

  console.log('Plugin system initialized with core plugins');
};

// 导出插件系统实例，方便其他模块使用
export { appPlugin, registerPlugins, I18nProvider, ApplicationPluginProvider, useAppPlugin };

export default appPlugin;
