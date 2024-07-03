import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { OrderEntity } from './order.entity';
import { DateTransformer, DecimalColumnTransformer } from 'src/common/utils/transformer';

@Entity({ name: 'order_items', orderBy: { created_at: 'DESC' } })
export class OrderItemEntity extends PublicEntity {
  @Column({ name: 'order_no', nullable: true })
  orderNo: string;

  @Column()
  name: string

  @Column({ name: 'material_no', })
  materialNo: string;

  @Column({ name: 'material_code', nullable: true })
  materialCode: string;

  @Column({ nullable: true })
  specification: string;
  @Column({
    name: 'task_order_no',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  taskOrderNo: string;

  @Column({ type: 'varchar', length: 255, comment: '单位', default: 'pcs' })
  unit: string;

  @Column({ type: 'datetime', nullable: true, transformer: new DateTransformer() })
  delivery: Date;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true, transformer: new DecimalColumnTransformer() })
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 10,
    scale: 3,
    comment: '单价',
    transformer: new DecimalColumnTransformer(),
  })
  unitPrice: number;

  @ManyToOne(() => OrderEntity, (order) => order.children)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;
}
