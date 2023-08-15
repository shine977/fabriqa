import { PublicEntity } from 'src/common/entity/PublicEntity';
import { TenantEntity } from 'src/tenant/entities/tenant.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
@Entity({ name: 'products', orderBy: { created_at: 'DESC' } })
export class ProductEntity extends PublicEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'material_id', nullable: true })
  materialId: string;

  @Column({ type: 'varchar', length: 255 })
  color: string;
}
