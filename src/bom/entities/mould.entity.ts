import { Column, Entity, OneToMany } from 'typeorm';
import { Part } from './part.entity';
import { PublicEntity } from 'src/shared/PublicEntity';

@Entity()
export class Mould extends PublicEntity {
  @Column({ type: 'varchar', length: 255, comment: '照片' })
  picture: string;
  @Column({ type: 'varchar', length: 60, comment: '几出几？' })
  xoutx: string;
  @OneToMany(() => Part, (part) => part)
  parts: Part[];
}
