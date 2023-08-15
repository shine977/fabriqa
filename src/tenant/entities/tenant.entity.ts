import { PublicEntity } from 'src/common/entity/PublicEntity';
import { DeliveryEntity } from 'src/deliveries/entities/delivery.entity';
import { OrderEntity } from 'src/orders/entities/order.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { Column, Entity, Generated, OneToMany } from 'typeorm';

@Entity({ name: 'tenants', orderBy: { created_at: 'DESC' } })
export class TenantEntity extends PublicEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
  @OneToMany(() => UserEntity, (user) => user.tenant)
  users: UserEntity[];
  @OneToMany(() => ProductEntity, (product) => product)
  products: ProductEntity[];

  @OneToMany(() => OrderEntity, (order) => order.tenant)
  orders: OrderEntity[];

  @OneToMany(() => DeliveryEntity, (delivery) => delivery.tenant)
  deliveries: OrderEntity[];
}
