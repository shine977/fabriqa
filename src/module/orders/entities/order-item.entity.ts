import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { OrderEntity } from './order.entity';
import { DecimalColumnTransformer } from 'src/common/utils/transformer';

@Entity({ name: 'order_items', orderBy: { created_at: 'DESC' } })
export class OrderItemEntity extends PublicEntity {
  @Column({ name: 'order_no' })
  orderNo: string;

  @Column({
    name: 'task_no',
    type: 'varchar',
    length: 255,
    comment: '任务书号',
    nullable: true,
  })
  taskNo: string;

  @Column({ type: 'varchar', length: 255, comment: '单位', default: 'pcs' })
  unit: string;
  @Column({ type: 'decimal', precision: 20, scale: 2, comment: '数量', transformer: new DecimalColumnTransformer() })
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

  @ManyToOne(() => OrderEntity, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;
}
