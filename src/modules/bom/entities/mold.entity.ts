import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ComponentEntity } from './component.entity';

import { DecimalColumnTransformer } from 'src/common/utils/transformer';

import { BaseEntity } from 'src/core/database/entities/base.entity';
import { FactoryEntity } from '@modules/factory/entities/factory.entity';

@Entity({ name: 'molds', orderBy: { createdAt: 'DESC' } })
export class MoldEntity extends BaseEntity {
  @Column({ comment: '模具名' })
  name: string;

  @Column({ comment: '照片' })
  pictures: string;

  @Column({ type: 'varchar', length: 60, comment: '几出几？' })
  xoutx: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    default: 0,
    comment: '价格',
    transformer: new DecimalColumnTransformer(),
  })
  price: number;

  @OneToMany(() => ComponentEntity, component => component, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'component_id' })
  component: ComponentEntity;

  @ManyToOne(() => FactoryEntity, customer => customer.molds, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'fac_id' })
  factory: FactoryEntity;
}
