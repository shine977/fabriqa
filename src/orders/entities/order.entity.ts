import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity, Index } from 'typeorm';
@Entity({ name: 'orders', orderBy: { created_at: 'DESC' } })
export class OrderEntity extends PublicEntity {
  @Index()
  @Column({ type: 'varchar', length: 255, comment: '订单号' })
  no: string;
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
  @Column({
    type: 'decimal',
    width: 50,
    precision: 2,
    comment: '金额',
    nullable: true,
  })
  amount: number;
  @Column({ type: 'datetime', name: 'purchase_date', comment: '采购日期' })
  purchaseDate: number;
  @Column({
    type: 'varchar',
    name: 'payment_clause',
    length: 255,
    comment: '付款条件',
  })
  paymentClause: string;
  @Column({ type: 'datetime', comment: '交期' })
  delivery: string;

  @Column({ type: 'json' })
  materials: [];
}
