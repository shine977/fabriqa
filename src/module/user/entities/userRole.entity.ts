// user_role.entity.ts
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { RoleEntity } from 'src/module/role/entities/role.entity';

@Entity({ name: 'user_role', orderBy: { created_at: 'DESC' } })
export class UserRoleEntity {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    roleId: number;

    @ManyToOne(() => UserEntity, user => user.roles)
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @ManyToOne(() => RoleEntity, role => role.userRoles)
    @JoinColumn({ name: 'roleId' })
    role: RoleEntity;
}
