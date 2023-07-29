import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity } from 'typeorm';
@Entity({ name: 'orders', orderBy: { created_at: 'DESC' } })
export class Order extends PublicEntity {
  @Column({ type: 'varchar', length: 255, comment: '订单号' })
  no: string;
  @Column({ type: 'varchar', length: 255, comment: '任务书号' })
  task_no: string;
  @Column({ type: 'varchar', length: 255, comment: '单位', default: 'pcs' })
  unit: string;

  @Column({ type: 'int', width: 50, comment: '数量' })
  quantity: number;
  @Column({ type: 'decimal', width: 50, precision: 2, comment: '单价' })
  unit_price: number;
  @Column({ type: 'decimal', width: 50, precision: 2, comment: '金额' })
  amount: number;

  @Column({ type: 'datetime', comment: '采购日期' })
  purchase_date: number;
  @Column({ type: 'varchar', length: 255, comment: '付款条件' })
  payment_clause: string;
  @Column({ type: 'datetime', comment: '交期' })
  delivery: string;
}
