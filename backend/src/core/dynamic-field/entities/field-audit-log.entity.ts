// src/core/dynamic-field/entities/field-audit-log.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('field_audit_logs')
@Index(['tenantId', 'moduleId', 'entityId'])
export class FieldAuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'module_id' })
  moduleId: string;

  @Column({ name: 'entity_id' })
  entityId: string;

  @Column({ name: 'field_id' })
  fieldId: string;

  @Column()
  action: 'create' | 'update' | 'delete';

  @Column({ name: 'old_value', type: 'jsonb', nullable: true })
  oldValue: any;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue: any;

  @Column({ name: 'user_id' })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
