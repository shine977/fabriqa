import { PublicEntity } from 'src/shared/PublicEntity';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'customers', orderBy: { created_at: 'DESC' } })
export class Customer extends PublicEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;
  @Column({ type: 'int', width: 50, nullable: true })
  groud_id: number;
}
