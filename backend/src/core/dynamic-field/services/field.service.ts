// src/core/dynamic-field/services/field.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';

import { FieldValueEntity } from '../entities/field-value.entity';
import { FieldValidator } from '../validators/field.validator';
import { FieldDefinition, FieldContext } from '../interfaces/field.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FieldDefinitionEntity } from '../entities/field-definition.entity';
import { FieldType, ValidationRule, ValidationType } from '../types/field.types';
import { PluginManager } from '@core/plugin';
import { DynamicFieldsEnabled } from '../interfaces/plugin.interface';
import { FieldAuditService } from './field-audit.service';

import { CreateFieldDefinitionDto } from '../dto/field-definition.dto';

@Injectable()
export class FieldService {
  constructor(
    @InjectRepository(FieldDefinitionEntity)
    private fieldDefRepo: Repository<FieldDefinitionEntity>,
    @InjectRepository(FieldValueEntity)
    private fieldValueRepo: Repository<FieldValueEntity>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private fieldValidator: FieldValidator,
    private pluginManager: PluginManager,
    private fieldAuditService: FieldAuditService,
  ) {}

  // 获取插件的动态字段定义
  async getPluginFields(moduleId: string): Promise<FieldDefinition[]> {
    const plugin = this.pluginManager.getPlugin(moduleId);
    if (plugin && 'getFieldDefinitions' in plugin) {
      const dynamicPlugin = plugin as DynamicFieldsEnabled;
      return await dynamicPlugin.getFieldDefinitions();
    }
    return [];
  }
  // 通知插件字段值变更
  async notifyFieldChange(moduleId: string, fieldName: string, oldValue: any, newValue: any): Promise<void> {
    const plugin = this.pluginManager.getPlugin(moduleId);
    if (plugin && 'onFieldChange' in plugin) {
      const dynamicPlugin = plugin as unknown as DynamicFieldsEnabled;
      await dynamicPlugin.onFieldChange(fieldName, oldValue, newValue);
    }
  }
  // 获取模块的字段定义
  async getModuleFields(context: FieldContext): Promise<FieldDefinition[]> {
    const cacheKey = `fields:${context.tenantId}:${context.moduleId}`;

    let fields = await this.cacheManager.get<FieldDefinition[]>(cacheKey);
    if (!fields) {
      fields = await this.fieldDefRepo.find({
        where: {
          tenantId: context.tenantId,
          moduleId: context.moduleId,
          isEnabled: true,
        },
        order: {
          order: 'ASC',
        },
      });
      await this.cacheManager.set(cacheKey, fields, 3600);
    }

    return fields;
  }

  async saveFieldValues(
    context: FieldContext,
    entityId: string,
    values: Record<string, any>,
    userId: string,
  ): Promise<void> {
    // Get old values first
    const fields = await this.getModuleFields(context);
    const oldValues = await this.getFieldValues(context, entityId);

    // Save new values
    const fieldValues = await Promise.all(
      fields.map(async field => {
        const value = values[field.name];
        // Validate value
        await this.fieldValidator.validate(value, field);

        return {
          tenantId: context.tenantId,
          moduleId: context.moduleId,
          entityId,
          fieldId: field.id,
          fieldType: field.type,
          ...this.getValueByType(field.type, value),
        };
      }),
    );

    await this.fieldValueRepo.save(fieldValues);

    //  // Record audit log and notify plugins
    for (const field of fields) {
      const newValue = values[field.name];
      const oldValue = oldValues[field.name];

      if (oldValue !== newValue) {
        // Record audit log
        await this.fieldAuditService.logFieldChange(
          context,
          entityId,
          field.id,
          oldValue ? 'update' : 'create',
          oldValue,
          newValue,
          userId,
        );

        // Notify plugin
        await this.notifyFieldChange(context.moduleId, field.name, oldValue, newValue);
      }
    }

    // Notify plugin if needed
    // await this.notifyFieldChange(context.moduleId, fieldId, oldValue, newValue);
  }

  // 获取字段值
  async getFieldValues(context: FieldContext, entityId: string): Promise<Record<string, any>> {
    const fields = await this.getModuleFields(context);
    const values = await this.fieldValueRepo.find({
      where: {
        tenantId: context.tenantId,
        moduleId: context.moduleId,
        entityId,
      },
    });

    return this.transformToObject(fields, values);
  }
  private mapValidationDtoToType(dto: CreateFieldDefinitionDto): FieldDefinition {
    const { validations, ...rest } = dto;
    return {
      ...rest,
      validations:
        validations?.map(validation => {
          const { type, message, params = {} } = validation;
          const baseValidation = { type, message };

          switch (type) {
            case 'regex':
              return {
                ...baseValidation,
                type: 'regex' as ValidationType.REGEX,
                pattern: params.pattern,
              } as ValidationRule;
            case 'range':
              return {
                ...baseValidation,
                type: 'range' as ValidationType.RANGE,
                min: params.min,
                max: params.max,
              } as ValidationRule;
            case 'length':
              return {
                ...baseValidation,
                type: 'length' as ValidationType.LENGTH,
                min: params.min,
                max: params.max,
              } as ValidationRule;
            case 'enum':
              return {
                ...baseValidation,
                type: 'enum' as ValidationType.ENUM,
                values: params.values,
              } as ValidationRule;
            case 'custom':
              return {
                ...baseValidation,
                type: 'custom' as ValidationType.CUSTOM,
                function: params.function,
              } as ValidationRule;
            case 'required':
              return {
                ...baseValidation,
                type: 'required' as ValidationType.REQUIRED,
              } as ValidationRule;
            default:
              throw new Error(`Unsupported validation type: ${type}`);
          }
        }) || [],
    };
  }

  async upsertField(context: FieldContext, dto: CreateFieldDefinitionDto): Promise<FieldDefinition> {
    // const field = await this.fieldDefRepo.save({
    //   tenantId: context.tenantId,
    //   moduleId: context.moduleId,
    //   ...fieldDef,
    // });
    const fieldDefinition = this.mapValidationDtoToType(dto);
    // 清除缓存
    const cacheKey = `fields:${context.tenantId}:${context.moduleId}`;
    await this.cacheManager.del(cacheKey);

    return fieldDefinition;
  }

  private async validateAndTransformValues(
    fields: FieldDefinition[],
    values: Record<string, any>,
  ): Promise<Record<string, any>> {
    const result = {};

    for (const field of fields) {
      const value = values[field.name];
      await this.fieldValidator.validate(value, field);
      result[field.name] = value;
    }

    return result;
  }

  private getValueByType(type: FieldType, value: any): Partial<FieldValueEntity> {
    switch (type) {
      case FieldType.STRING:
        return { stringValue: value };
      case FieldType.NUMBER:
        return { numberValue: value };
      case FieldType.BOOLEAN:
        return { booleanValue: value };
      case FieldType.DATE:
        return { dateValue: value };
      default:
        return { jsonValue: value };
    }
  }

  private transformToObject(fields: FieldDefinition[], values: FieldValueEntity[]): Record<string, any> {
    const result = {};
    const valueMap = new Map(values.map(v => [v.fieldId, v]));

    for (const field of fields) {
      const value = valueMap.get(field.id);
      if (value) {
        result[field.name] = this.getValueFromEntity(value);
      }
    }

    return result;
  }

  private getValueFromEntity(entity: FieldValueEntity): any {
    if (entity.stringValue !== null) return entity.stringValue;
    if (entity.numberValue !== null) return entity.numberValue;
    if (entity.booleanValue !== null) return entity.booleanValue;
    if (entity.dateValue !== null) return entity.dateValue;
    return entity.jsonValue;
  }
}
