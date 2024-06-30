import { PublicEntity } from 'src/common/entity/PublicEntity';
import { DecimalColumnTransformer } from 'src/common/utils/transformer';
import { FactoryEntity } from 'src/module/factory/entities/factory.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

enum PayStatus {
  'UNPAID' = 'UNPAID',
  'PAID' = 'PAID',
}

@Entity({ name: 'statements', orderBy: { created_at: 'DESC' } })
export class StatementEntity extends PublicEntity {

  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ name: 'delivery_date', type: 'varchar', length: 255, nullable: true })
  deliveryDate: Date;

  @Column({ type: 'decimal', precision: 20, scale: 2, transformer: new DecimalColumnTransformer() })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 3, transformer: new DecimalColumnTransformer() })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 20, scale: 3, transformer: new DecimalColumnTransformer(), nullable: true })
  amount: number;


  @ManyToOne(() => FactoryEntity, (factory) => factory.statements, { createForeignKeyConstraints: false })
  factory: FactoryEntity;
}
