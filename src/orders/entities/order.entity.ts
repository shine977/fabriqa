import { PublicEntity } from 'src/common/entity/PublicEntity';
import { TenantEntity } from 'src/tenant/entities/tenant.entity';
import { ORDER } from 'src/types/Order';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { DecimalColumnTransformer } from 'src/common/utils/transformer';

@Entity({ name: 'orders', orderBy: { created_at: 'DESC' } })
export class OrderEntity extends PublicEntity {
  @Index()
  @Column({ type: 'varchar', length: 255, comment: '订单号' })
  no: string;
  @Column()
  type: ORDER;
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 3,
    comment: '金额',
    nullable: true,
    transformer: new DecimalColumnTransformer(),
  })
  amount: number;

  @Column({ type: 'datetime', name: 'purchase_date', comment: '采购日期' })
  purchaseDate: Date;

  @Column({
    type: 'varchar',
    name: 'payment_clause',
    length: 255,
    comment: '付款条件',
  })
  paymentClause: string;

  @Column({ type: 'datetime', comment: '交期' })
  delivery: Date;

  @Column({ type: 'json' })
  materials: [];

  @ManyToOne(() => TenantEntity, (tenant) => tenant.orders, { createForeignKeyConstraints: false })
  tenant: TenantEntity;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.order)
  items: OrderItemEntity[];
}
