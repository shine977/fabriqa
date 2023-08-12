import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ComponentEntity } from './component.entity';
import { PublicEntity } from 'src/common/entity/PublicEntity';
import { CustomerEntity } from 'src/customers/entities/customer.entity';

@Entity({ name: 'molds', orderBy: { created_at: 'DESC' } })
export class MoldEntity extends PublicEntity {
  @Column({ comment: '模具名' })
  name: string;

  @Column({ comment: '照片' })
  pictures: string;

  @Column({ type: 'varchar', length: 60, comment: '几出几？' })
  xoutx: string;

  @Column({ type: 'decimal', precision: 2, default: 0, comment: '价格' })
  price: number;

  @OneToMany(() => ComponentEntity, (component) => component)
  components: ComponentEntity;

  @ManyToOne(() => CustomerEntity, (customer) => customer.molds, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ name: 'tenant_Id' })
  tenantId: string;
}
