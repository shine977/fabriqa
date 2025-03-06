import { UpdateDateColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { BaseEntity } from './base.entity';

export abstract class AuditableEntity extends BaseEntity {
  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy: string;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'tenant_id' })
  tenantId: string;

  // 其他你需要的审计字段
  @Column({ nullable: true, name: 'ip_address' })
  ipAddress?: string;

  @Column({ nullable: true, name: 'user_agent' })
  userAgent?: string;
}
