import { RoleEntity } from 'src/module/role/entities/role.entity';
import { RolePermissionEnitity } from 'src/module/role/entities/rolePermission.entity';
import { TenantEntity } from 'src/module/tenant/entities/tenant.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';

@Entity({ name: 'resource', orderBy: { created_at: 'DESC' } })
export class ResourceEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    type: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @ManyToOne(() => TenantEntity, { createForeignKeyConstraints: false })
    @JoinColumn({ name: 'tenant_id', },)
    tenant: TenantEntity;

    @ManyToMany(() => RoleEntity, role => role.menus, { createForeignKeyConstraints: false })
    @JoinTable()
    roles: RoleEntity[];
}