import { Column } from 'typeorm';

export abstract class TenantBaseEntity {
  @Column({ name: 'tenant_id', nullable: true })
  tenantId: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: string;
}
