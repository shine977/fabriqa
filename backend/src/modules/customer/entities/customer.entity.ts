import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/core/database/entities/base.entity';
import { OrderEntity } from '@modules/orders/entities/order.entity';

export enum CustomerType {
  END_CUSTOMER = 'end_customer', // 终端客户
  ASSEMBLY = 'assembly',        // 组装厂客户
  PARTS = 'parts',             // 零部件厂客户
}

@Entity('customers')
export class CustomerEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'enum', enum: CustomerType })
  type: CustomerType;

  @Column({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  address: string;

  @OneToMany(() => OrderEntity, order => order.customer)
  orders: OrderEntity[];
}
