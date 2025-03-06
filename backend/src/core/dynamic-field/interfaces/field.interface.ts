import { FieldType, ValidationRule } from '../types/field.types';

// src/core/dynamic-field/interfaces/field.interface.ts
export interface FieldDefinition {
  id?: string;
  name: string;
  label: string;
  type: FieldType;
  isSystem?: boolean;
  isRequired?: boolean;
  defaultValue?: any;
  order?: number;
  validations?: ValidationRule[];
  metadata?: Record<string, any>;
  tenantId?: string;
  moduleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface FieldOption {
  label: string;
  value: any;
  metadata?: Record<string, any>;
}

export interface FieldContext {
  tenantId: string;
  moduleId?: string;
  userId?: string;
}
