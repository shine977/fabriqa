import React, { useEffect, useState } from 'react';
import * as FiIcons from 'react-icons/fi';  // Feather Icons
import * as FaIcons from 'react-icons/fa';  // Font Awesome Icons
import * as AiIcons from 'react-icons/ai';  // Ant Design Icons
import * as MdIcons from 'react-icons/md';  // Material Design Icons
import * as IoIcons from 'react-icons/io';  // Ionicons
import * as Bs from 'react-icons/bs';       // Bootstrap Icons

// 全局图标库注册
const IconRegistry = {
  fi: FiIcons,
  fa: FaIcons,
  ai: AiIcons,
  md: MdIcons,
  io: IoIcons,
  bs: Bs,
};

// 全局存储已加载的图标组件
const loadedIcons: Record<string, React.ComponentType<any>> = {};

/**
 * 全局图标渲染组件
 */
interface IconRendererProps {
  iconName: string; // 格式: "fi:FiHome" 或 "fa:FaUser" 等，使用冒号分隔
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const IconRenderer: React.FC<IconRendererProps> = ({ 
  iconName, 
  size = 20, 
  color = 'currentColor',
  className = '',
  style = {},
  onClick
}) => {
  // 空值处理
  if (!iconName) return null;
  
  // 如果图标已经加载过，直接从缓存中取
  if (loadedIcons[iconName]) {
    const CachedIcon = loadedIcons[iconName];
    return <CachedIcon size={size} color={color} className={className} style={style} onClick={onClick} />;
  }
  
  // 解析图标名称，格式应为: "库前缀:图标名"，如 "fi:FiHome"
  const [library, name] = iconName.split(':');
  
  // 获取对应的图标库
  const IconLibrary = IconRegistry[library as keyof typeof IconRegistry];
  
  if (!IconLibrary) {
    console.warn(`Icon library "${library}" not found`);
    return null;
  }
  
  // 从库中获取对应的图标组件
  const Icon = IconLibrary[name as keyof typeof IconLibrary];
  
  if (!Icon) {
    console.warn(`Icon "${name}" not found in library "${library}"`);
    return null;
  }
  
  // 缓存图标组件以便重用
  loadedIcons[iconName] = Icon;
  
  return <Icon size={size} color={color} className={className} style={style} onClick={onClick} />;
};

/**
 * 预加载一组图标的组件
 */
interface IconPreloaderProps {
  icons: string[]; // 图标名称数组
  children?: React.ReactNode;
}

export const IconPreloader: React.FC<IconPreloaderProps> = ({ icons, children }) => {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // 预加载所有指定的图标
    icons.forEach(iconName => {
      if (!iconName) return;
      
      const [library, name] = iconName.split(':');
      const IconLibrary = IconRegistry[library as keyof typeof IconRegistry];
      
      if (!IconLibrary) {
        console.warn(`Icon library "${library}" not found`);
        return;
      }
      
      const Icon = IconLibrary[name as keyof typeof IconLibrary] as React.ComponentType<{
        size?: number | string;
        color?: string;
        className?: string;
        style?: React.CSSProperties;
        onClick?: () => void;
      }>;
      
      
      if (!Icon) {
        console.warn(`Icon "${name}" not found in library "${library}"`);
        return;
      }
      
      loadedIcons[iconName] = Icon;
    });
    
    setLoaded(true);
  }, [icons]);
  
  return <>{loaded && children}</>;
};

/**
 * 全局统一注册所有常用图标的组件
 * 可以在应用启动时使用一次
 */
export const GlobalIconRegistry: React.FC = () => {
  // 这里列出你应用中常用的图标
  const commonIcons = [
    "fi:FiHome",
    "fi:FiUser",
    "fi:FiSettings",
    "fi:FiMenu",
    "fi:FiFile",
    "fa:FaTable",
    "md:MdDashboard",
  ];
  
  useEffect(() => {
    // 预加载常用图标
    commonIcons.forEach(iconName => {
      const [library, name] = iconName.split(':');
      const IconLibrary = IconRegistry[library as keyof typeof IconRegistry];
      
      if (IconLibrary && IconLibrary[name as keyof typeof IconLibrary]) {
        loadedIcons[iconName] = IconLibrary[name as keyof typeof IconLibrary];
      }
    });
    
    console.log('预加载了', Object.keys(loadedIcons).length, '个图标');
  }, []);
  
  // 组件不渲染任何可见内容
  return null;
};

export default IconRenderer;