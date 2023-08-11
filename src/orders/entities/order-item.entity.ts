import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column } from 'typeorm';

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
  @Column({ type: 'int', width: 50, comment: '数量' })
  quantity: number;
  @Column({
    name: 'unit_price',
    type: 'decimal',
    width: 50,
    precision: 2,
    comment: '单价',
  })
  unitPrice: number;
}
