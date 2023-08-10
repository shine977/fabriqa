import { PublicEntity } from 'src/common/entity/PublicEntity';
import { TenantEntity } from 'src/tenant/entities/tenant.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
@Entity({ name: 'deliveries', orderBy: { created_at: 'DESC' } })
export class DeliveryEntity extends PublicEntity {
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
  @Column({ type: 'decimal', width: 65, precision: 2 })
  quantity: number;
  @Column({ type: 'decimal', width: 65, precision: 2 })
  actual_quantity_received: number;

  @ManyToOne(() => TenantEntity, (tenant) => tenant.deliveries)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;
}
