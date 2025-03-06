// src/core/dynamic-field/interfaces/plugin.interface.ts

import { ApplicationPlugin } from '@core/plugin';
import { FieldDefinition } from './field.interface';

export interface DynamicFieldsEnabled {
  getFieldDefinitions(): Promise<FieldDefinition[]>;
  onFieldChange?(fieldName: string, oldValue: any, newValue: any): Promise<void>;
}

// 扩展插件接口
export interface IPluginWithFields extends ApplicationPlugin, Partial<DynamicFieldsEnabled> {}
