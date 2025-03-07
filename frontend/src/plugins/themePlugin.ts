/**
 * Theme Plugin
 * 
 * 主题插件，提供浅色/深色主题切换功能
 * 支持自动检测系统主题及手动切换
 */

import { Plugin } from '../types';
import { PluginSystemImpl } from './pluginSystem';

// 定义主题类型
export type ThemeMode = 'light' | 'dark' | 'system';

// 设置事件名称常量
export const THEME_CHANGED = 'theme:changed';

// 主题设置存储键
const THEME_STORAGE_KEY = 'fabriqa_theme_mode';

// 获取当前系统主题偏好
const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// 从存储中获取主题设置
const getSavedTheme = (): ThemeMode => {
  return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'system';
};

// 保存主题设置到本地存储
const saveTheme = (mode: ThemeMode): void => {
  localStorage.setItem(THEME_STORAGE_KEY, mode);
};

// 应用主题到文档
const applyTheme = (mode: ThemeMode): void => {
  const actualMode = mode === 'system' ? getSystemTheme() : mode;
  
  if (actualMode === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // 更新meta标签以支持移动设备的主题色
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', actualMode === 'dark' ? '#171717' : '#ffffff');
  } else {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = actualMode === 'dark' ? '#171717' : '#ffffff';
    document.head.appendChild(meta);
  }
};

class ThemeManager {
  private currentMode: ThemeMode;
  private listeners: Array<(mode: ThemeMode) => void> = [];
  private systemThemeMediaQuery: MediaQueryList;
  
  constructor() {
    this.currentMode = getSavedTheme();
    this.systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // 监听系统主题变化
    this.systemThemeMediaQuery.addEventListener('change', this.handleSystemThemeChange);
    
    // 初始应用主题
    this.applyCurrentTheme();
  }
  
  private handleSystemThemeChange = (): void => {
    if (this.currentMode === 'system') {
      this.applyCurrentTheme();
    }
  };
  
  public getCurrentTheme(): ThemeMode {
    return this.currentMode;
  }
  
  public getEffectiveTheme(): 'light' | 'dark' {
    return this.currentMode === 'system' ? getSystemTheme() : this.currentMode;
  }
  
  public setTheme(mode: ThemeMode): void {
    if (this.currentMode !== mode) {
      this.currentMode = mode;
      saveTheme(mode);
      this.applyCurrentTheme();
      this.notifyListeners();
    }
  }
  
  public toggleTheme(): void {
    const effectiveTheme = this.getEffectiveTheme();
    this.setTheme(effectiveTheme === 'light' ? 'dark' : 'light');
  }
  
  private applyCurrentTheme(): void {
    applyTheme(this.currentMode);
  }
  
  public subscribe(listener: (mode: ThemeMode) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.currentMode);
    }
  }
  
  public cleanup(): void {
    this.systemThemeMediaQuery.removeEventListener('change', this.handleSystemThemeChange);
  }
}

let themeManager: ThemeManager;

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
      return `${title} | Fabriqa Admin`;
    },
    
    // 向布局添加主题状态和控制器
    'layout:theme': () => {
      return {
        currentMode: themeManager.getCurrentTheme(),
        effectiveTheme: themeManager.getEffectiveTheme(),
        setTheme: themeManager.setTheme.bind(themeManager),
        toggleTheme: themeManager.toggleTheme.bind(themeManager),
        subscribe: themeManager.subscribe.bind(themeManager)
      };
    },
    
    // 自定义UI组件的主题
    'component:themeClass': (baseClasses: string, componentType: string) => {
      // 可以根据组件类型返回不同的样式类
      const themeClasses: Record<string, Record<string, string>> = {
        button: {
          light: 'bg-white text-neutral-800 hover:bg-neutral-100',
          dark: 'bg-neutral-800 text-white hover:bg-neutral-700'
        },
        card: {
          light: 'bg-white border-neutral-200 shadow-sm',
          dark: 'bg-neutral-800 border-neutral-700 shadow-dark'
        },
        input: {
          light: 'bg-white border-neutral-300 text-neutral-900 focus:border-primary-500',
          dark: 'bg-neutral-700 border-neutral-600 text-white focus:border-primary-400'
        }
      };
      
      const effectiveTheme = themeManager.getEffectiveTheme();
      const additionalClasses = themeClasses[componentType]?.[effectiveTheme] || '';
      
      return `${baseClasses} ${additionalClasses}`.trim();
    }
  },
  
  // 插件初始化
  initialize: (pluginSystem: PluginSystemImpl) => {
    console.log('Theme plugin initialized');
    
    // 初始化主题管理器
    themeManager = new ThemeManager();
    
    // 在插件被注销时清理
    return () => {
      themeManager.cleanup();
    };
  }
};

export default themePlugin;
