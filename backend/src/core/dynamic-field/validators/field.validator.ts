// src/core/dynamic-field/validators/field.validator.ts
import { Injectable } from '@nestjs/common';
import { FieldDefinition } from '../interfaces/field.interface';
import { ValidationType, FieldType, ValidationRule } from '../types/field.types';

@Injectable()
export class FieldValidator {
  async validate(value: any, field: FieldDefinition): Promise<boolean> {
    if (field.isRequired && (value === null || value === undefined)) {
      throw new Error(`Field ${field.name} is required`);
    }

    if (value === null || value === undefined) {
      return true;
    }

    // Type validation
    await this.validateType(value, field.type);

    // Custom validation rules
    if (field.validations) {
      for (const validation of field.validations) {
        await this.validateRule(value, validation);
      }
    }

    return true;
  }

  private async validateType(value: any, type: FieldType): Promise<void> {
    switch (type) {
      case FieldType.STRING:
        if (typeof value !== 'string') {
          throw new Error('Value must be a string');
        }
        break;
      case FieldType.NUMBER:
        if (typeof value !== 'number') {
          throw new Error('Value must be a number');
        }
        break;
      case FieldType.BOOLEAN:
        if (typeof value !== 'boolean') {
          throw new Error('Value must be a boolean');
        }
        break;
      case FieldType.DATE:
        if (!(value instanceof Date)) {
          throw new Error('Value must be a date');
        }
        break;
      case FieldType.ARRAY:
        if (!Array.isArray(value)) {
          throw new Error('Value must be an array');
        }
        break;
      case FieldType.OBJECT:
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          throw new Error('Value must be an object');
        }
        break;
    }
  }

  private async validateRule(value: any, validation: ValidationRule): Promise<void> {
    switch (validation.type) {
      case ValidationType.REGEX:
        if (typeof value !== 'string') {
          throw new Error(validation.message || 'Value must be a string for regex validation');
        }
        if (!new RegExp(validation.pattern).test(value)) {
          throw new Error(validation.message || `Value does not match pattern ${validation.pattern}`);
        }
        break;

      case ValidationType.RANGE:
        if (typeof value !== 'number') {
          throw new Error(validation.message || 'Value must be a number for range validation');
        }
        if (validation.min !== undefined && value < validation.min) {
          throw new Error(validation.message || `Value must be greater than or equal to ${validation.min}`);
        }
        if (validation.max !== undefined && value > validation.max) {
          throw new Error(validation.message || `Value must be less than or equal to ${validation.max}`);
        }
        break;

      case ValidationType.LENGTH:
        if (!value?.hasOwnProperty('length')) {
          throw new Error(validation.message || 'Value must have a length property');
        }
        if (validation.min !== undefined && value.length < validation.min) {
          throw new Error(validation.message || `Length must be at least ${validation.min}`);
        }
        if (validation.max !== undefined && value.length > validation.max) {
          throw new Error(validation.message || `Length must be at most ${validation.max}`);
        }
        break;

      case ValidationType.ENUM:
        if (!validation.values?.includes(value)) {
          throw new Error(validation.message || `Value must be one of: ${validation.values?.join(', ')}`);
        }
        break;

      case ValidationType.CUSTOM:
        try {
          const result = await new Function('value', validation.function)(value);
          if (result !== true) {
            throw new Error(validation.message || String(result));
          }
        } catch (error) {
          throw new Error(validation.message || `Custom validation error: ${error.message}`);
        }
        break;

      case ValidationType.REQUIRED:
        if (value === null || value === undefined || value === '') {
          throw new Error(validation.message || 'Field is required');
        }
        break;
    }
  }
}
