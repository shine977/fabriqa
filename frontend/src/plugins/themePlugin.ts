/**
 * Theme Plugin
 * 
 * 一个简单的主题插件，用于演示插件系统的功能
 */

import { Plugin } from '../types';
import { PluginSystemImpl } from './pluginSystem';

const themePlugin: Plugin = {
  id: 'theme-plugin',
  name: 'Theme Plugin',
  version: '1.0.0',
  description: 'A plugin that provides theming capabilities',
  enabled: true,
  priority: 10, // 高优先级
  
  hooks: {
    // 修改页面标题
    'page:title': (title: string) => {
      return `${title} | Admin System`;
    },
    
    // 添加样式类到页面组件
    'component:beforeRender': (component: React.ReactNode, props: any) => {
      // 这里可以添加自定义逻辑以修改组件
      // 只是一个示例，实际中可能需要更复杂的逻辑
      return component;
    },
    
    // 在表单提交前处理数据
    'form:beforeSubmit': (formData: any) => {
      console.log('Form data before submit:', formData);
      return formData;
    }
  },
  
  // 插件初始化
  initialize: (pluginSystem: PluginSystemImpl) => {
    console.log('Theme plugin initialized');
    
    // 可以在这里执行其他初始化操作
    // 例如：注册事件监听器、加载配置等
  }
};

export default themePlugin;
