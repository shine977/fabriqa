
import { PublicEntity } from "src/common/entity/PublicEntity";
import { Column, Entity } from "typeorm";


@Entity({ name: 'policies', orderBy: { created_at: 'DESC' } })
export class PolicyEntity extends PublicEntity {


    @Column()
    resourceType: string;  // 这条策略适用的资源类型

    @Column()
    department: string;  // 允许访问资源的部门

    @Column()
    permission: string;  // 允许的操作，例如 'read', 'write', 'delete'
}
