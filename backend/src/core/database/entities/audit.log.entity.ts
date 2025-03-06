import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('audit_logs')
export class AuditLogEntity extends BaseEntity {
  @Column({ name: 'entity_name' })
  entityName: string;

  @Column({ name: 'entity_id' })
  entityId: string;

  @Column()
  action: string;

  @Column({ type: 'text', nullable: true, name: 'old_value' })
  oldValue: string;

  @Column({ type: 'text', name: 'new_value' })
  newValue: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'ip_address' })
  ipAddress: string;

  @Column({ name: 'user_agent' })
  userAgent: string;
}
