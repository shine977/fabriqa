// src/core/dynamic-field/entities/field-dependency.entity.ts

import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@core/database/entities';
import { DependencyType, DependencyCondition, DependencyAction } from '../interfaces/field-dependency.interface';

@Entity('field_dependencies')
export class FieldDependencyEntity extends BaseEntity {
  @Column({ name: 'module_id' })
  moduleId: string;

  @Column({ name: 'source_field_id' })
  sourceFieldId: string;

  @Column({ name: 'target_field_id' })
  targetFieldId: string;

  @Column({
    type: 'enum',
    enum: DependencyType,
  })
  type: DependencyType;

  @Column('jsonb')
  condition: DependencyCondition;

  @Column('jsonb')
  action: DependencyAction;

  @Column()
  priority: number;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @Column('jsonb', { name: 'metadata', nullable: true })
  metadata?: Record<string, any>;
}
