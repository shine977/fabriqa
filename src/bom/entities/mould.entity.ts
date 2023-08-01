import { Column, Entity, OneToMany } from 'typeorm';
import { PartEntity } from './part.entity';
import { PublicEntity } from 'src/common/entity/PublicEntity';
import { CustomerEntity } from 'src/customers/entities/customer.entity';

@Entity({ name: 'moulds', orderBy: { created_at: 'DESC' } })
export class MouldEntity extends PublicEntity {
  @Column({ type: 'varchar', length: 255, comment: '照片' })
  picture: string;
  @Column({ type: 'varchar', length: 60, comment: '几出几？' })
  xoutx: string;
  @Column({ type: 'decimal', precision: 2, default: 0 })
  price: number;
  @OneToMany(() => PartEntity, (part) => part)
  parts: PartEntity;
  @OneToMany(() => CustomerEntity, (customer) => customer.moulds)
  customers: CustomerEntity[];
}
