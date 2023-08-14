import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ComponentEntity } from './component.entity';

export enum MATERIAL_TYPE {
  PLASTIC = 'plastic',
  RUBBER = 'rubber',
  METAL = 'metal',
}

@Entity({ name: 'materials', orderBy: { created_at: 'DESC' } })
export class MaterialEntity extends PublicEntity {
  @Column({ type: 'varchar', length: 100, comment: '材料名称' })
  name: string;

  @Column({ type: 'decimal', precision: 2, comment: '单价', default: 0 })
  price: number;

  @Column({
    type: 'enum',
    enum: MATERIAL_TYPE,
    default: MATERIAL_TYPE.PLASTIC,
    comment: '材料类型',
  })
  type: string;

  @Column({ type: 'varchar', name: 'code', length: 100, comment: '料号', nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 30, comment: '颜色', nullable: true })
  color: string;

  @Column({ type: 'varchar', length: 255, comment: '牌号', nullable: true })
  grade: string;

  @Column({ type: 'varchar', length: 255, comment: '厂家' })
  factory: string;

  @Column({ type: 'varchar', length: 255, comment: '照片', nullable: true })
  picture: string;

  @OneToMany(() => ComponentEntity, (component) => component.material)
  components: ComponentEntity[];
}
