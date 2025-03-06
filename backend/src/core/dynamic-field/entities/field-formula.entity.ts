// src/core/dynamic-field/entities/field-formula.entity.ts

import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@core/database/entities';
import { ExpressionNode } from '../interfaces/field-formula.interface';

@Entity('field_formulas')
export class FieldFormulaEntity extends BaseEntity {
  @Column({ name: 'module_id' })
  moduleId: string;

  @Column()
  name: string;

  @Column({ name: 'description', nullable: true })
  description?: string;

  @Column({ name: 'target_field_id' })
  targetFieldId: string;

  @Column({ name: 'expression' })
  expression: string;

  @Column('jsonb', { name: 'parsed_expression' })
  parsedExpression: ExpressionNode;

  @Column('simple-array', { name: 'dependencies' })
  dependencies: string[];

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @Column('jsonb', { name: 'metadata', nullable: true })
  metadata?: Record<string, any>;
}
