import { Part } from 'src/bom/entities/part.entity';
import { PublicEntity } from 'src/common/entity/PublicEntity';
import { AfterLoad, Column, Entity, VirtualColumn } from 'typeorm';
@Entity({ name: 'orders', orderBy: { created_at: 'DESC' } })
export class Order extends PublicEntity {
  @Column({ type: 'varchar', length: 255, comment: '订单号' })
  no: string;
  @Column({ type: 'varchar', length: 255, comment: '任务书号', nullable: true })
  task_no: string;
  @Column({ type: 'varchar', length: 255, comment: '单位', default: 'pcs' })
  unit: string;
  @Column({ type: 'int', width: 50, comment: '数量' })
  quantity: number;
  @Column({ type: 'decimal', width: 50, precision: 2, comment: '单价' })
  unit_price: number;
  // @Column({
  //   type: 'decimal',
  //   width: 50,
  //   precision: 2,
  //   comment: '金额',
  //   nullable: true,
  // })
  // @VirtualColumn({
  //   type: 'decimal',
  //   query: (entity) => {
  //     `SELECT SUM(balance) FROM account WHERE ownerId = ${entity}.id AND deleted_at IS NULL`;
  //   },
  // })
  @AfterLoad()
  amount() {
    return (this.unit_price || 0) * (this.quantity || 0);
  }
  @Column({ type: 'datetime', comment: '采购日期' })
  purchase_date: number;
  @Column({ type: 'varchar', length: 255, comment: '付款条件' })
  payment_clause: string;
  @Column({ type: 'datetime', comment: '交期' })
  delivery: string;
  @VirtualColumn({
    type: 'decimal',
    query: (alias) =>
      `SELECT SUM(totalAmount) FROM orders WHERE  deleted_at IS NULL`,
  })
  totalAmount: number;
  materials: Part[];
}
