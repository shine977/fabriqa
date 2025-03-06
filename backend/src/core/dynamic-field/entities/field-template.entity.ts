// src/core/dynamic-field/entities/field-template.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { FieldDefinition } from '../interfaces/field.interface';
import { BaseEntity } from '@core/database/entities';

@Entity('field_templates')
export class FieldTemplateEntity extends BaseEntity {
  @Column()
  @Index()
  name: string;

  @Column()
  description: string;

  @Column({ name: 'module_type' })
  @Index()
  moduleType: string;

  @Column({ name: 'fields', type: 'jsonb' })
  fields: FieldDefinition[];

  @Column({ name: 'order_num', type: 'int', default: 0 })
  orderNum: number;

  @Column({ name: 'base_template_id', nullable: true })
  baseTemplateId?: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'is_system_default', default: false })
  isSystemDefault: boolean;

  @Column({ name: 'version', default: 1 })
  version: number;

  @Column({ name: 'status', default: 'active' })
  status: 'active' | 'inactive' | 'deprecated';

  @CreateDateColumn({ name: 'effective_from' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', nullable: true })
  effectiveTo?: Date;

  //   toJSON() {
  //     return {
  //       ...this,
  //       fields: this.fields || [],
  //     };
  //   }
}
