import { PublicEntity } from 'src/common/entity/PublicEntity';
import { DecimalColumnTransformer } from 'src/common/utils/transformer';
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

  @ManyToOne(() => TenantEntity, (tenant) => tenant.deliveries, { createForeignKeyConstraints: false })
  tenant: TenantEntity;
}
