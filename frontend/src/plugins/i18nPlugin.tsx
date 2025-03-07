/**
 * i18n Plugin
 * 
 * 国际化插件，提供多语言支持功能
 * 支持动态切换语言、自动检测浏览器语言偏好
 * 集成React组件和Hook，便于在组件中使用翻译
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next, useTranslation as useI18nextTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { Plugin } from '../types';
import { PluginSystemImpl } from './pluginSystem';

// 导入翻译文件
import enCommon from '../locales/en-US/common.json';
import zhCommon from '../locales/zh-CN/common.json';
// 导入用户模块翻译资源
import enUser from '../locales/en-US/user.json';
import zhUser from '../locales/zh-CN/user.json';

// 支持的语言列表
export type Language = 'zh-CN' | 'en-US';

// 语言名称映射
export const languageNames: Record<Language, string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
};

// 语言选项配置
export const languageOptions = [
  { value: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { value: 'en-US', label: 'English', flag: '🇺🇸' },
];

// 语言存储键
const LANGUAGE_STORAGE_KEY = 'fabriqa_language';

// 从存储中获取语言设置
const getSavedLanguage = (): Language => {
  const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
  return savedLang || navigator.language as Language || 'zh-CN';
};

// 保存语言设置到本地存储
const saveLanguage = (lang: Language): void => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
};

// 加载语言资源
const loadResources = () => {
  // 资源命名空间配置
  const resources = {
    'en-US': {
      common: enCommon,
      user: enUser
    },
    'zh-CN': {
      common: zhCommon,
      user: zhUser
    }
  };
  
  return resources;
};

// 初始化i18n实例
const initializeI18n = (defaultLanguage: Language) => {
  const resources = loadResources();
  
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: defaultLanguage,
      fallbackLng: 'zh-CN',
      ns: ['common', 'user'],
      defaultNS: 'common',
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        lookupLocalStorage: LANGUAGE_STORAGE_KEY,
        caches: ['localStorage'],
      },
      react: {
        useSuspense: false,
      },
    });
    
  return i18n;
};

// 语言管理器
class LanguageManager {
  private currentLanguage: Language;
  private listeners: Array<(lang: Language) => void> = [];
  private i18nInstance: typeof i18n;
  
  constructor() {
    this.currentLanguage = getSavedLanguage();
    this.i18nInstance = initializeI18n(this.currentLanguage);
  }
  
  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }
  
  setLanguage(lang: Language): void {
    if (this.currentLanguage !== lang) {
      this.currentLanguage = lang;
      saveLanguage(lang);
      this.i18nInstance.changeLanguage(lang);
      this.notifyListeners();
    }
  }
  
  subscribe(listener: (lang: Language) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }
  
  getI18nInstance(): typeof i18n {
    return this.i18nInstance;
  }
}

// 创建React上下文
const I18nContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  i18n: typeof i18n;
}>({} as any);

// 提供React Hook
export const useLanguage = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useLanguage必须在I18nProvider内部使用');
  }
  return context;
};

// 整合react-i18next的useTranslation hook
export const useTranslation = () => {
  const { i18n } = useLanguage();
  const { t } = useI18nextTranslation();
  return {
    t,
    i18n,
    language: i18n.language as Language,
  };
};

// React Provider组件
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!languageManager) {
    languageManager = new LanguageManager();
  }
  
  const [language, setLanguageState] = useState<Language>(languageManager.getCurrentLanguage());
  
  const setLanguage = (lang: Language) => {
    languageManager.setLanguage(lang);
  };
  
  useEffect(() => {
    return languageManager.subscribe(lang => setLanguageState(lang));
  }, []);
  
  return (
    <I18nContext.Provider value={{ language, setLanguage, i18n: languageManager.getI18nInstance() }}>
      {children}
    </I18nContext.Provider>
  );
};

// 全局语言管理器实例
let languageManager: LanguageManager;

// 导出翻译函数，用于非React环境
export const t = (key: string, options?: any) => {
  if (!languageManager) languageManager = new LanguageManager();
  return languageManager.getI18nInstance().t(key, options);
};

// 国际化插件
const i18nPlugin: Plugin = {
  id: 'i18n-plugin',
  name: 'I18n Plugin',
  version: '1.0.0',
  description: '提供多语言支持功能',
  enabled: true,
  hooks: {
    // 提供语言切换功能的钩子
    'language:get': () => {
      if (!languageManager) languageManager = new LanguageManager();
      return languageManager.getCurrentLanguage();
    },
    'language:set': (_, lang: Language) => {
      if (!languageManager) languageManager = new LanguageManager();
      languageManager.setLanguage(lang);
      return lang;
    },
    'language:getOptions': () => {
      return languageOptions;
    },
    'translate': (_, key: string, options?: any) => {
      return t(key, options);
    },
  },
  
  // 插件初始化
  initialize(pluginSystem: PluginSystemImpl) {
    // 实例化语言管理器
    if (!languageManager) {
      languageManager = new LanguageManager();
    }
    
    // 将i18n实例暴露到全局
    window.__i18n = {
      t: t,
      changeLanguage: (lang: Language) => languageManager.setLanguage(lang),
      getCurrentLanguage: () => languageManager.getCurrentLanguage(),
      i18n: languageManager.getI18nInstance(),
    };
    
    // 简化全局访问方法
    window.t = t;
    window.changeLanguage = window.__i18n.changeLanguage;
    window.getCurrentLanguage = window.__i18n.getCurrentLanguage;
    window.i18n = window.__i18n.i18n;
  }
};

// 为全局声明的__i18n变量添加类型定义
declare global {
  interface Window {
    __i18n: {
      t: typeof i18n.t;
      changeLanguage: (lang: Language) => void;
      getCurrentLanguage: () => Language;
      i18n: typeof i18n;
    }
    t: typeof i18n.t;
    changeLanguage: (lang: Language) => void;
    getCurrentLanguage: () => Language;
    i18n: typeof i18n;
  }
}

export default i18nPlugin;
