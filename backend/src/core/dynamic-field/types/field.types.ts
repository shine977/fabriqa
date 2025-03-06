// src/core/dynamic-field/types/field.types.ts
export enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  ENUM = 'enum',
  OBJECT = 'object',
  ARRAY = 'array',
  REFERENCE = 'reference',
  FILE = 'file',
  IMAGE = 'image',
  RICH_TEXT = 'rich_text',
}

export enum ValidationType {
  REGEX = 'regex',
  RANGE = 'range',
  LENGTH = 'length',
  ENUM = 'enum',
  CUSTOM = 'custom',
  REQUIRED = 'required',
}

export type FieldValue = string | number | boolean | Date | object | any[];

export interface BaseValidation {
  type: ValidationType;
  message?: string;
}

export interface RegexValidation extends BaseValidation {
  type: ValidationType.REGEX;
  pattern: string;
}

export interface RangeValidation extends BaseValidation {
  type: ValidationType.RANGE;
  min?: number;
  max?: number;
}

export interface LengthValidation extends BaseValidation {
  type: ValidationType.LENGTH;
  min?: number;
  max?: number;
}

export interface EnumValidation extends BaseValidation {
  type: ValidationType.ENUM;
  values: any[];
}

export interface CustomValidation extends BaseValidation {
  type: ValidationType.CUSTOM;
  function: string;
}

export interface RequiredValidation extends BaseValidation {
  type: ValidationType.REQUIRED;
}

export type ValidationRule =
  | RegexValidation
  | RangeValidation
  | LengthValidation
  | EnumValidation
  | CustomValidation
  | RequiredValidation;
