import { Exclude } from 'class-transformer';
import { PublicEntity } from 'src/shared/PublicEntity';
import { Column, Entity, Generated, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends PublicEntity {
  @Generated('uuid')
  uid: string;
  @Column()
  username: string;
  @Column()
  password: string;
}
