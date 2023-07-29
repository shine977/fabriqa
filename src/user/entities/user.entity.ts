import { generateString } from '@nestjs/typeorm';
import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity, Generated } from 'typeorm';

@Entity()
export class User extends PublicEntity {
  @Generated('uuid')
  @Column({ type: 'varchar', length: 64 })
  uid: string;
  @Column({ unique: true, length: 32 })
  username: string;
  @Column()
  password: string;
  @Column({ unique: true, nullable: true })
  email: string;
}
