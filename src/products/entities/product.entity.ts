import { PublicEntity } from 'src/shared/PublicEntity';
import { Column, Entity } from 'typeorm';
@Entity({ name: 'products', orderBy: { created_at: 'DESC' } })
export class Product extends PublicEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
  @Column({ type: 'varchar', length: 255 })
  material: string;
  @Column({ type: 'varchar', length: 255 })
  color: string;
  @Column({ type: 'decimal', precision: 2, width: 50 })
  price: number;
}
