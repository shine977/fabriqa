// src/core/dynamic-field/interfaces/field-validation.interface.ts

/**
 * Validation type enum
 */
export enum ValidationRuleType {
  REGEX = 'regex',
  RANGE = 'range',
  LENGTH = 'length',
  ENUM = 'enum',
  CUSTOM = 'custom',
}

/**
 * Base validation interface
 */
export interface BaseValidation {
  type: ValidationRuleType;
  message?: string;
}

/**
 * Regex validation
 */
export interface RegexValidation extends BaseValidation {
  type: ValidationRuleType.REGEX;
  pattern: string;
}

/**
 * Range validation
 */
export interface RangeValidation extends BaseValidation {
  type: ValidationRuleType.RANGE;
  min?: number;
  max?: number;
}

/**
 * Length validation
 */
export interface LengthValidation extends BaseValidation {
  type: ValidationRuleType.LENGTH;
  min?: number;
  max?: number;
}

/**
 * Enum validation
 */
export interface EnumValidation extends BaseValidation {
  type: ValidationRuleType.ENUM;
  values: any[];
}

/**
 * Custom validation
 */
export interface CustomValidation extends BaseValidation {
  type: ValidationRuleType.CUSTOM;
  function: string;
}

/**
 * Union type of all validations
 */
export type ValidationType = RegexValidation | RangeValidation | LengthValidation | EnumValidation | CustomValidation;
