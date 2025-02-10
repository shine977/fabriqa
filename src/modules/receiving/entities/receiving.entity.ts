import { BaseEntity } from 'src/core/database/entities/base.entity';
import { DecimalColumnTransformer } from 'src/common/utils/transformer';
import { DateTransformer } from 'src/common/utils/transformer'; // Add this line

import { Column, Entity, ManyToOne } from 'typeorm';
import { FactoryEntity } from '@modules/factory/entities/factory.entity';

@Entity({ name: 'receiving_report', orderBy: { createdAt: 'DESC' } })
export class ReceivingEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'materialCode', type: 'varchar', length: 255, nullable: true })
  materialCode: string;

  @Column({ name: 'partNo', type: 'varchar', length: 255, nullable: true })
  partNo: string;

  @Column({ name: 'orderNo', type: 'varchar', length: 255, nullable: true })
  orderNo: string;

  @Column({ name: 'taskOrderNo', type: 'varchar', length: 255, nullable: true })
  taskOrderNo: string;

  @Column({ name: 'deliveryDate', type: 'timestamp', nullable: true, transformer: new DateTransformer() })
  deliveryDate: Date;

  @Column({ type: 'decimal', precision: 20, scale: 2, transformer: new DecimalColumnTransformer() })
  quantity: number;

  @Column({ name: 'unitPrice', type: 'decimal', precision: 10, scale: 3, transformer: new DecimalColumnTransformer() })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 20, scale: 3, transformer: new DecimalColumnTransformer(), nullable: true })
  amount: number;

  @ManyToOne(() => FactoryEntity, factory => factory.statements, { createForeignKeyConstraints: false })
  factory: FactoryEntity;
}
