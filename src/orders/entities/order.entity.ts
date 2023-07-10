import { PublicEntity } from 'src/shared/PublicEntity';
import { Column, Entity } from 'typeorm';
@Entity({ name: 'orders', orderBy: { created_at: 'DESC' } })
export class Order extends PublicEntity {
  @Column({ type: 'varchar', length: 255 })
  no: string;
  @Column({ type: 'varchar', length: 255 })
  task_no: string;
  @Column({ type: 'varchar', length: 255 })
  unit: string;

  @Column({ type: 'int', width: 50 })
  quantity: number;
  @Column({ type: 'decimal', width: 50, precision: 2 })
  unit_price: number;
  @Column({ type: 'decimal', width: 50, precision: 2 })
  amount: number;
}
