/**
 * Plugins Index
 *
 * 插件系统入口文件，负责初始化和注册所有插件
 */

import { appPlugin, registerPlugins, ApplicationPluginProvider, useAppPlugin } from './ApplicationPlugin';
import themePlugin from './themePlugin';
import dataTablePlugin from './dataTablePlugin';
import i18n, { I18nProvider, changeLanguage, getCurrentLanguage } from './i18nPlugin';
import authPlugin from './authPlugin';

/**
 * 初始化插件系统
 */
export const initializePlugins = (): void => {
  // 注册核心插件
  registerPlugins([
    themePlugin,
    // i18n现在是一个服务而不是插件，不需要注册
    dataTablePlugin,
    authPlugin,
  ]);
};

// 导出i18n相关功能
export { I18nProvider, changeLanguage, getCurrentLanguage };

// 导出插件系统实例，方便其他模块使用
export { appPlugin, registerPlugins, ApplicationPluginProvider, useAppPlugin };

export default appPlugin;
