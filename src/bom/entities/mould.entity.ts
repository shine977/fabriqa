import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { PartEntity } from './part.entity';
import { PublicEntity } from 'src/common/entity/PublicEntity';
import { CustomerEntity } from 'src/customers/entities/customer.entity';

@Entity({ name: 'moulds', orderBy: { created_at: 'DESC' } })
export class MouldEntity extends PublicEntity {
  @Column({ comment: '模具名' })
  name: string;

  @Column({ comment: '照片' })
  pictures: string;

  @Column({ type: 'varchar', length: 60, comment: '几出几？' })
  xoutx: string;

  @Column({ type: 'decimal', precision: 2, default: 0, comment: '价格' })
  price: number;

  @OneToMany(() => PartEntity, (part) => part)
  parts: PartEntity;

  @ManyToOne(() => CustomerEntity, (customer) => customer.moulds)
  customer: CustomerEntity;
}
