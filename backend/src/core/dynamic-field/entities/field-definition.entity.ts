// src/core/dynamic-field/entities/field-definition.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { FieldDefinition } from '../interfaces/field.interface';
import { FieldType, ValidationRule } from '../types/field.types';

@Entity('field_definitions')
export class FieldDefinitionEntity implements FieldDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  label: string;

  @Column({
    type: 'enum',
    enum: FieldType,
  })
  type: FieldType;

  @Column({ name: 'is_system', default: false })
  isSystem?: boolean;

  @Column({ name: 'is_required', default: false })
  isRequired?: boolean;

  @Column({ name: 'default_value', type: 'jsonb', nullable: true })
  defaultValue?: any;

  @Column({ name: 'order', type: 'int', nullable: true })
  order?: number;

  @Column({ name: 'validations', type: 'jsonb', nullable: true })
  validations?: ValidationRule[];

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'module_id' })
  moduleId: string;

  @Column({ name: 'version', type: 'int', nullable: true })
  version?: number;

  @Column({ name: 'previous_version_id', nullable: true })
  previousVersionId?: string;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: string;
}
