import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { PlasticPartsEntity } from './plasticParts.entity';
import { PublicEntity } from 'src/common/entity/PublicEntity';
import { FactoryEntity } from 'src/module/factory/entities/factory.entity';
import { DecimalColumnTransformer } from 'src/common/utils/transformer';

@Entity({ name: 'molds', orderBy: { created_at: 'DESC' } })
export class MoldEntity extends PublicEntity {
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

  @OneToMany(() => PlasticPartsEntity, (component) => component, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'plastic_parts' })
  plasticPart: PlasticPartsEntity;

  @ManyToOne(() => FactoryEntity, (customer) => customer.molds, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'fac_id' })
  factory: FactoryEntity;
}
