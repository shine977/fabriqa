import { BaseEntity } from 'src/core/database/entities/base.entity';
import { DecimalColumnTransformer } from '@shared/utils/transformer';
import { TenantEntity } from 'src/shared/entities/tenant.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
@Entity({ name: 'deliveries', orderBy: { createdAt: 'DESC' } })
export class DeliveryEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  no: string;
  @Column({ type: 'varchar', length: 255 })
  order_no: string;
  @Column({ type: 'varchar', length: 255 })
  task_no: string;
  @Column({ type: 'varchar', length: 255 })
  part_no: string;
  @Column({ type: 'varchar', length: 255 })
  material_code: string;
  @Column({ type: 'varchar', length: 255 })
  name: string;
  @Column({ type: 'varchar', length: 255 })
  unit: string;
  @Column({ type: 'decimal', precision: 20, scale: 3, transformer: new DecimalColumnTransformer() })
  quantity: number;
  @Column({
    name: 'actual_quantity_received',
    type: 'decimal',
    precision: 20,
    scale: 3,
    transformer: new DecimalColumnTransformer(),
  })
  actualQuantityReceived: number;

  @ManyToOne(() => TenantEntity, tenant => tenant.deliveries, { createForeignKeyConstraints: false })
  tenant: TenantEntity;
}
