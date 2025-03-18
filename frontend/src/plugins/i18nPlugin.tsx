/**
 * i18n Service
 * 
 * 简化的国际化服务，提供多语言支持功能
 * 支持动态切换语言、检测浏览器语言偏好
 */

import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import React, { createContext, useContext, useEffect, useState } from 'react';

// 导入翻译文件
import enCommon from '../locales/en-US/common.json';
import zhCommon from '../locales/zh-CN/common.json';
import enUser from '../locales/en-US/user.json';
import zhUser from '../locales/zh-CN/user.json';
import enMenu from '../locales/en-US/menu.json';
import zhMenu from '../locales/zh-CN/menu.json';
import enNavigation from '../locales/en-US/navigation.json';
import zhNavigation from '../locales/zh-CN/navigation.json';

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

// 初始化i18n实例
const resources = {
  'en-US': {
    common: enCommon,
    user: enUser,
    menu: enMenu,
    navigation: enNavigation
  },
  'zh-CN': {
    common: zhCommon,
    user: zhUser,
    menu: zhMenu,
    navigation: zhNavigation
  }
};

// 获取初始语言
const initialLanguage = getSavedLanguage();

// 初始化i18n实例
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'zh-CN',
      ns: ['common', 'user', 'menu', 'navigation'],
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
}

// 导出简单的语言切换函数
export const changeLanguage = (lang: Language): void => {
  try {
    i18n.changeLanguage(lang);
    saveLanguage(lang);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// 获取当前语言
export const getCurrentLanguage = (): Language => {
  return i18n.language as Language || initialLanguage;
};

// 简易的翻译函数，带错误处理
const t = (key: string, defaultValue?: string): string => {
  try {
    const result = i18n.t(key, { defaultValue });
    return result || defaultValue || key;
  } catch (error) {
    console.error(`Translation error for key '${key}':`, error);
    return defaultValue || key;
  }
};

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

// React Provider组件
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getCurrentLanguage());
  
  const setLanguage = (lang: Language) => {
    changeLanguage(lang);
    setLanguageState(lang);
  };
  
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageState(getCurrentLanguage());
    };
    
    // 监听i18n语言变化
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);
  
  return (
    <I18nContext.Provider value={{ language, setLanguage, i18n }}>
      {children}
    </I18nContext.Provider>
  );
};



// 导出useTranslation hook供React组件使用
export { useTranslation };

// 为全局声明的i18n变量添加类型定义
declare global {
  interface Window {
    i18n: typeof i18n;
  }
}

// 全局变量便于开发调试
window.i18n = i18n;
