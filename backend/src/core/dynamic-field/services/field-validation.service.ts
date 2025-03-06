// src/core/dynamic-field/services/field-validation.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { FieldDefinition } from '../interfaces/field.interface';
import { ValidationType, ValidationRule, FieldType } from '../types/field.types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  metadata?: Record<string, any>;
}

@Injectable()
export class FieldValidationService {
  private readonly logger = new Logger(FieldValidationService.name);

  /**
   * Validate field value against its definition
   */
  async validateField(
    fieldDef: FieldDefinition,
    value: any,
    options: {
      ignoreRequired?: boolean;
      context?: Record<string, any>;
    } = {},
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const metadata: Record<string, any> = {};

    try {
      // Skip validation if value is null/undefined and not required
      if (value === null || value === undefined) {
        if (!options.ignoreRequired && fieldDef.isRequired) {
          errors.push(this.formatError(fieldDef.name, 'is required'));
        }
        return { isValid: errors.length === 0, errors, warnings, metadata };
      }

      // Type validation
      const typeValidation = this.validateType(fieldDef.type, value);
      if (!typeValidation.isValid) {
        errors.push(this.formatError(fieldDef.name, typeValidation.error));
        return { isValid: false, errors, warnings, metadata };
      }

      // Custom validations
      if (fieldDef.validations?.length) {
        for (const validation of fieldDef.validations) {
          const result = await this.validateRule(validation, value, {
            fieldDef,
            context: options.context,
          });

          if (result.error) {
            if (result.severity === 'warning') {
              warnings.push(this.formatError(fieldDef.name, result.error));
            } else {
              errors.push(this.formatError(fieldDef.name, result.error));
            }
          }

          // Collect validation metadata
          if (result.metadata) {
            Object.assign(metadata, result.metadata);
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      };
    } catch (error) {
      this.logger.error(`Validation error for field ${fieldDef.name}: ${error.message}`, error.stack);
      errors.push(this.formatError(fieldDef.name, 'Internal validation error occurred'));
      return { isValid: false, errors, warnings, metadata };
    }
  }

  /**
   * Validate value type with detailed error message
   */
  private validateType(type: FieldType, value: any): { isValid: boolean; error?: string } {
    switch (type) {
      case FieldType.STRING:
        return {
          isValid: typeof value === 'string',
          error: 'must be a string',
        };
      case FieldType.NUMBER:
        return {
          isValid: typeof value === 'number' && !isNaN(value),
          error: 'must be a valid number',
        };
      case FieldType.BOOLEAN:
        return {
          isValid: typeof value === 'boolean',
          error: 'must be a boolean',
        };
      case FieldType.DATE:
        return {
          isValid: value instanceof Date && !isNaN(value.getTime()),
          error: 'must be a valid date',
        };
      case FieldType.ARRAY:
        return {
          isValid: Array.isArray(value),
          error: 'must be an array',
        };
      case FieldType.OBJECT:
        return {
          isValid: typeof value === 'object' && value !== null && !Array.isArray(value),
          error: 'must be an object',
        };
      case FieldType.ENUM:
        return {
          isValid: typeof value === 'string' || typeof value === 'number',
          error: 'must be a string or number',
        };
      case FieldType.REFERENCE:
        return {
          isValid: typeof value === 'string' || typeof value === 'number',
          error: 'must be a valid reference ID',
        };
      case FieldType.FILE:
      case FieldType.IMAGE:
        return {
          isValid: typeof value === 'object' && value !== null,
          error: 'must be a valid file object',
        };
      case FieldType.RICH_TEXT:
        return {
          isValid: typeof value === 'string',
          error: 'must be a string',
        };
      default:
        return { isValid: true };
    }
  }

  /**
   * Validate custom rule with metadata support
   */
  private async validateRule(
    validation: ValidationRule,
    value: any,
    context: {
      fieldDef: FieldDefinition;
      context?: Record<string, any>;
    },
  ): Promise<{
    error?: string;
    severity?: 'error' | 'warning';
    metadata?: Record<string, any>;
  }> {
    const { type, message } = validation;

    try {
      switch (type) {
        case ValidationType.REGEX:
          return this.validateRegex(value, validation);
        case ValidationType.RANGE:
          return this.validateRange(value, validation);
        case ValidationType.LENGTH:
          return this.validateLength(value, validation);
        case ValidationType.ENUM:
          return this.validateEnum(value, validation);
        case ValidationType.CUSTOM:
          return this.validateCustom(value, validation, context);
        case ValidationType.REQUIRED:
          return this.validateRequired(value, validation);
        default:
          return { error: `Unsupported validation type: ${type}` };
      }
    } catch (error) {
      this.logger.error(`Validation rule error: ${error.message}`, error.stack);
      return { error: message || 'Validation rule error occurred' };
    }
  }

  private validateRegex(value: any, validation: ValidationRule): { error?: string } {
    if (typeof value !== 'string' || !('pattern' in validation)) {
      return { error: validation.message || 'Invalid regex validation' };
    }
    try {
      const regex = new RegExp(validation.pattern);
      return regex.test(value)
        ? {}
        : { error: validation.message || `Value does not match pattern ${validation.pattern}` };
    } catch (error) {
      return { error: `Invalid regex pattern: ${error.message}` };
    }
  }

  private validateRange(value: any, validation: ValidationRule): { error?: string } {
    if (typeof value !== 'number' || !('min' in validation || 'max' in validation)) {
      return { error: validation.message || 'Invalid range validation' };
    }
    const { min, max } = validation as { min?: number; max?: number };
    if (min !== undefined && value < min) {
      return { error: validation.message || `Value must be greater than or equal to ${min}` };
    }
    if (max !== undefined && value > max) {
      return { error: validation.message || `Value must be less than or equal to ${max}` };
    }
    return {};
  }

  private validateLength(value: any, validation: ValidationRule): { error?: string } {
    if (!value?.hasOwnProperty('length') || !('min' in validation || 'max' in validation)) {
      return { error: validation.message || 'Invalid length validation' };
    }
    const { min, max } = validation as { min?: number; max?: number };
    if (min !== undefined && value.length < min) {
      return { error: validation.message || `Length must be at least ${min}` };
    }
    if (max !== undefined && value.length > max) {
      return { error: validation.message || `Length must be at most ${max}` };
    }
    return {};
  }

  private validateEnum(value: any, validation: ValidationRule): { error?: string } {
    if (!('values' in validation) || !Array.isArray(validation.values)) {
      return { error: validation.message || 'Invalid enum validation' };
    }
    return validation.values.includes(value)
      ? {}
      : { error: validation.message || `Value must be one of: ${validation.values.join(', ')}` };
  }

  private async validateCustom(
    value: any,
    validation: ValidationRule,
    context: {
      fieldDef: FieldDefinition;
      context?: Record<string, any>;
    },
  ): Promise<{
    error?: string;
    severity?: 'error' | 'warning';
    metadata?: Record<string, any>;
  }> {
    if (!('function' in validation) || typeof validation.function !== 'string') {
      return { error: validation.message || 'Invalid custom validation' };
    }

    try {
      // Create a safe evaluation context
      const evalContext = {
        value,
        field: context.fieldDef,
        context: context.context || {},
      };

      const customFn = new Function(
        'value',
        'field',
        'context',
        `
        try {
          ${validation.function}
        } catch (error) {
          return { error: error.message };
        }
      `,
      );

      const result = await customFn(evalContext.value, evalContext.field, evalContext.context);

      if (result === true) {
        return {};
      }

      if (typeof result === 'object') {
        return {
          error: result.message || validation.message,
          severity: result.severity,
          metadata: result.metadata,
        };
      }

      return {
        error: validation.message || String(result),
      };
    } catch (error) {
      return { error: validation.message || `Custom validation error: ${error.message}` };
    }
  }

  private validateRequired(value: any, validation: ValidationRule): { error?: string } {
    return value === null || value === undefined || value === ''
      ? { error: validation.message || 'Field is required' }
      : {};
  }

  private formatError(fieldName: string, message: string): string {
    return `${fieldName} ${message}`;
  }
}
