import { PublicEntity } from 'src/common/entity/PublicEntity';
import { TenantEntity } from 'src/tenant/entities/tenant.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
@Entity({ name: 'orders', orderBy: { created_at: 'DESC' } })
export class OrderEntity extends PublicEntity {
  @Index()
  @Column({ type: 'varchar', length: 255, comment: '订单号' })
  no: string;

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

  @ManyToOne(() => TenantEntity, (tenant) => tenant.orders, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'tenant_id' })
  tenant: TenantEntity;
}
