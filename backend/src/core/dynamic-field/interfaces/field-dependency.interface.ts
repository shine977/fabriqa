// src/core/dynamic-field/interfaces/field-dependency.interface.ts

/**
 * Field dependency types
 */
export enum DependencyType {
  VISIBILITY = 'visibility', // Control field visibility
  REQUIRED = 'required', // Control field required state
  VALUE = 'value', // Control field value
  VALIDATION = 'validation', // Control field validation rules
}

/**
 * Field dependency operators
 */
export enum DependencyOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'neq',
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  IN = 'in',
  NOT_IN = 'not_in',
  BETWEEN = 'between',
  EMPTY = 'empty',
  NOT_EMPTY = 'not_empty',
}

/**
 * Field dependency action types
 */
export enum DependencyActionType {
  SHOW = 'show',
  HIDE = 'hide',
  REQUIRE = 'require',
  OPTIONAL = 'optional',
  SET_VALUE = 'setValue',
  CLEAR_VALUE = 'clearValue',
  ENABLE = 'enable',
  DISABLE = 'disable',
}

/**
 * Field dependency condition interface
 */
export interface DependencyCondition {
  operator: DependencyOperator;
  value?: any;
  values?: any[]; // For IN, NOT_IN, BETWEEN operators
}

/**
 * Field dependency action interface
 */
export interface DependencyAction {
  type: DependencyActionType;
  value?: any; // For SET_VALUE action
  message?: string; // Custom message for validation
}

/**
 * Field dependency interface
 */
export interface FieldDependency {
  id: string;
  sourceFieldId: string;
  targetFieldId: string;
  type: DependencyType;
  condition: DependencyCondition;
  action: DependencyAction;
  priority: number; // For handling multiple dependencies
  isEnabled: boolean;
  metadata?: Record<string, any>;
}
