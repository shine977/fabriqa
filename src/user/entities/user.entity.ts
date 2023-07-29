import { PublicEntity } from 'src/shared/PublicEntity';
import { Column, Entity, Generated } from 'typeorm';

@Entity()
export class User extends PublicEntity {
  @Generated('uuid')
  uid: string;
  @Column({ unique: true })
  username: string;
  @Column()
  password: string;
  @Column({ unique: true })
  email: string;
}
