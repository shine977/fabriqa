import { generateString } from '@nestjs/typeorm';
import { PublicEntity } from 'src/common/entity/PublicEntity';
import { Column, Entity, Generated } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity extends PublicEntity {
  @Generated('uuid')
  @Column({ type: 'varchar', length: 64 })
  uid: string;
  @Column({ unique: true, length: 32 })
  username: string;
  @Column({ type: 'char', length: 255 })
  password: string;
  @Column({ unique: true, nullable: true, length: 100 })
  email: string;
}
