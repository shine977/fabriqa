// src/core/dynamic-field/services/field-dependency.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldDependencyEntity } from '../entities/field-dependency.entity';
import {
  FieldDependency,
  DependencyType,
  DependencyOperator,
  DependencyActionType,
  DependencyAction,
  DependencyCondition,
} from '../interfaces/field-dependency.interface';
import { FieldContext } from '../interfaces/field.interface';

@Injectable()
export class FieldDependencyService {
  constructor(
    @InjectRepository(FieldDependencyEntity)
    private dependencyRepo: Repository<FieldDependencyEntity>,
  ) {}

  /**
   * Create a new field dependency
   */
  async createDependency(
    context: FieldContext,
    dependency: Omit<FieldDependency, 'id'>,
  ): Promise<FieldDependencyEntity> {
    return this.dependencyRepo.save({
      ...dependency,
      tenantId: context.tenantId,
      moduleId: context.moduleId,
    });
  }

  /**
   * Get dependencies for a specific field
   */
  async getFieldDependencies(context: FieldContext, fieldId: string): Promise<FieldDependencyEntity[]> {
    return this.dependencyRepo.find({
      where: {
        tenantId: context.tenantId,
        moduleId: context.moduleId,
        targetFieldId: fieldId,
        isEnabled: true,
      },
      order: {
        priority: 'ASC',
      },
    });
  }

  /**
   * Evaluate field dependencies
   */
  async evaluateDependencies(context: FieldContext, fieldValues: Record<string, any>): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    // Get all dependencies for the module
    const dependencies = await this.dependencyRepo.find({
      where: {
        tenantId: context.tenantId,
        moduleId: context.moduleId,
        isEnabled: true,
      },
      order: {
        priority: 'ASC',
      },
    });

    // Evaluate each dependency
    for (const dependency of dependencies) {
      const sourceValue = fieldValues[dependency.sourceFieldId];
      if (this.evaluateCondition(dependency.condition, sourceValue)) {
        result[dependency.targetFieldId] = this.applyAction(dependency.action, fieldValues[dependency.targetFieldId]);
      }
    }

    return result;
  }

  /**
   * Evaluate a single dependency condition
   */
  private evaluateCondition(condition: DependencyCondition, value: any): boolean {
    switch (condition.operator) {
      case DependencyOperator.EQUALS:
        return value === condition.value;
      case DependencyOperator.NOT_EQUALS:
        return value !== condition.value;
      case DependencyOperator.GREATER_THAN:
        return value > condition.value;
      case DependencyOperator.LESS_THAN:
        return value < condition.value;
      case DependencyOperator.CONTAINS:
        return String(value).includes(String(condition.value));
      case DependencyOperator.NOT_CONTAINS:
        return !String(value).includes(String(condition.value));
      case DependencyOperator.IN:
        return condition.values?.includes(value) ?? false;
      case DependencyOperator.NOT_IN:
        return !(condition.values?.includes(value) ?? true);
      case DependencyOperator.BETWEEN:
        return value >= condition.values?.[0] && value <= condition.values?.[1];
      case DependencyOperator.EMPTY:
        return value === null || value === undefined || value === '';
      case DependencyOperator.NOT_EMPTY:
        return value !== null && value !== undefined && value !== '';
      default:
        return false;
    }
  }

  /**
   * Apply dependency action
   */
  private applyAction(action: DependencyAction, currentValue: any): any {
    switch (action.type) {
      case DependencyActionType.SET_VALUE:
        return action.value;
      case DependencyActionType.CLEAR_VALUE:
        return null;
      default:
        return currentValue;
    }
  }
}
