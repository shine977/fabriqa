import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { TenantBaseEntity } from '@core/tenant/tenant.entity';

export abstract class BaseEntity extends TenantBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', precision: 0 })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', precision: 0 })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true, precision: 0 })
  @Exclude()
  deletedAt: Date | null;

  @Column({ name: 'deleted_by', nullable: true })
  @Exclude()
  deletedBy: string | null;

  @Column({ name: 'tenant_id', nullable: true })
  tenantId: string;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @Column({ name: 'order_num', default: 0 })
  orderNum: number;

  // toJSON() {
  //   return {
  //     id: this.id,
  //     tenantId: this.tenantId,
  //     createdAt: this.createdAt,
  //     updatedAt: this.updatedAt,
  //     deletedAt: this.deletedAt,
  //     isEnabled: this.isEnabled,
  //     orderNum: this.orderNum,
  //   };
  // }
  // setCurrentUser(id?: string) {
  //   if (!id) return;
  //   this.id = id;
  // }
}
