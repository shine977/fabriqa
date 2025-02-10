import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { ComponentEntity } from './component.entity';
import { DecimalColumnTransformer } from 'src/common/utils/transformer';
import { BaseEntity } from 'src/core/database/entities/base.entity';
import { FactoryEntity } from '@modules/factory/entities/factory.entity';

export enum MATERIAL_TYPE {
  PLASTIC = 'PLASTIC',
  RUBBER = 'RUBBER',
  METAL = 'METAL',
}

@Entity({ name: 'materials', orderBy: { createdAt: 'DESC' } })
export class MaterialEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100, comment: '材料名称' })
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 3,
    comment: '单价',
    nullable: true,
    transformer: new DecimalColumnTransformer(),
  })
  price: number;

  @Column({
    type: 'enum',
    enum: MATERIAL_TYPE,
    default: MATERIAL_TYPE.PLASTIC,
    comment: '材料类型',
  })
  type: string;

  @Column({ type: 'varchar', name: 'code', length: 100, comment: '料号', nullable: true })
  no: string;

  @Column({ type: 'varchar', length: 30, comment: '颜色', nullable: true })
  color: string;

  @Column({ type: 'varchar', length: 255, comment: '牌号', nullable: true })
  grade: string;

  @Column({ type: 'varchar', length: 255, comment: '厂家' })
  vendor: string;

  @Column({ type: 'varchar', length: 255, comment: '照片', nullable: true })
  picture: string;

  @OneToMany(() => ComponentEntity, component => component.material)
  component: ComponentEntity[];

  @ManyToMany(() => FactoryEntity, factory => factory.materials, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'factory_id' })
  factory: FactoryEntity[];
}
