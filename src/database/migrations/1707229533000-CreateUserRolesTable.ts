import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserRolesTable1707229533000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 删除可能存在的表
        await queryRunner.dropTable('user_roles', true);

        // 创建新表，不使用外键约束
        await queryRunner.createTable(
            new Table({
                name: 'user_roles',
                columns: [
                    {
                        name: 'user_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'role_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                ],
                indices: [
                    {
                        name: 'IDX_USER_ROLES_USER',
                        columnNames: ['user_id'],
                    },
                    {
                        name: 'IDX_USER_ROLES_ROLE',
                        columnNames: ['role_id'],
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('user_roles');
    }
}
