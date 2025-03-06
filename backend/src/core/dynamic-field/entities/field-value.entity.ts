// src/core/dynamic-field/entities/field-value.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { FieldType } from '../types/field.types';

@Entity('field_values')
@Index(['tenantId', 'moduleId', 'entityId'])
export class FieldValueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column({ name: 'module_id' })
  @Index()
  moduleId: string;

  @Column({ name: 'entity_id' })
  @Index()
  entityId: string;

  @Column({ name: 'field_id' })
  fieldId: string;

  @Column({
    type: 'enum',
    enum: FieldType,
  })
  fieldType: FieldType;
  // different types of value columns
  @Column({ name: 'string_value', type: 'text', nullable: true })
  stringValue: string;

  @Column({ name: 'number_value', type: 'numeric', nullable: true })
  numberValue: number;

  @Column({ name: 'boolean_value', type: 'boolean', nullable: true })
  booleanValue: boolean;

  @Column({ name: 'date_value', type: 'timestamp', nullable: true })
  dateValue: Date;

  @Column({ name: 'json_value', type: 'jsonb', nullable: true })
  jsonValue: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
