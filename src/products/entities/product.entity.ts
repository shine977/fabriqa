import { PublicEntity } from 'src/common/entity/PublicEntity';
import { TenantEntity } from 'src/tenant/entities/tenant.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
@Entity({ name: 'products', orderBy: { created_at: 'DESC' } })
export class ProductEntity extends PublicEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
  @Column({ type: 'varchar', length: 255 })
  material: string;
  @Column({ type: 'varchar', length: 255 })
  color: string;
  @Column({ type: 'decimal', precision: 2, width: 50 })
  price: number;

  @ManyToOne(() => TenantEntity, (tenant) => tenant.products)
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;
}
