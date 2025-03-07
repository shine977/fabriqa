/**
 * Data Table Plugin
 * 
 * 提供高度可定制的数据表格功能，支持自定义列、过滤器、排序和分页
 */

import React from 'react';
import { Plugin } from '../types';

// 单元格渲染器接口
export interface CellRenderer<T = any> {
  (value: any, row: T, index: number): React.ReactNode;
}

// 过滤处理器接口
export interface FilterProcessor<T = any> {
  (data: T[], filterValue: any): T[];
}

// 状态单元格渲染器接口
export interface StatusCellRenderer<T = any> {
  (status: string, row: T, index: number): React.ReactNode;
}

// 表格设置接口
export interface DataTableSettings {
  pageSize: number;
  pageSizeOptions: number[];
  showSorter: boolean;
  showFilter: boolean;
  showSelection: boolean;
  density: 'default' | 'compact' | 'comfortable';
  bordered: boolean;
  striped: boolean;
  hovered: boolean;
}

// 数据表格插件实现
const dataTablePlugin: Plugin = {
  id: 'dataTable',
  name: 'Data Table',
  version: '1.0.0',
  description: '强大的数据表格组件，支持排序、过滤、分页等功能',
  enabled: true,
  priority: 10,
  
  // 空的hooks对象，钩子将在initialize方法中注册
  hooks: {},
  
  // 初始化插件 - 使用传入的插件系统实例注册钩子
  initialize: function(pluginSystem) {
    // 自定义列渲染器
    pluginSystem.addHook(this.id, 'dataTable:columnRenderer', function(defaultRenderer, column, settings) {
      return defaultRenderer;
    });
    
    // 自定义过滤器渲染器
    pluginSystem.addHook(this.id, 'dataTable:filterRenderer', function(defaultRenderer, column, settings) {
      return defaultRenderer;
    });
    
    // 自定义排序逻辑
    pluginSystem.addHook(this.id, 'dataTable:sorter', function(defaultSorter, data, sortInfo) {
      return defaultSorter(data, sortInfo);
    });
    
    // 自定义行选择
    pluginSystem.addHook(this.id, 'dataTable:rowSelection', function(defaultSelection, row, index) {
      return defaultSelection;
    });
    
    // 自定义状态单元格渲染
    pluginSystem.addHook(this.id, 'dataTable:statusCellRenderer', function(defaultRenderer, status, row, index) {
      // 默认状态渲染逻辑
      return defaultRenderer;
    });
    
    // 自定义过滤处理
    pluginSystem.addHook(this.id, 'dataTable:filterProcessor', function(defaultProcessor, data, filterValue) {
      return defaultProcessor(data, filterValue);
    });
    
    // 表格设置修改钩子
    pluginSystem.addHook(this.id, 'dataTable:settings', function(defaultSettings) {
      // 可以在这里修改默认设置
      return defaultSettings;
    });
    
    console.log('Data Table Plugin initialized');
  }
};

export default dataTablePlugin;
