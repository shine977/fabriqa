import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector,) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const tenantId = user.tenant_id;
        const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());

        // 获取用户在当前租户下的角色权限
        // const permissions = await this.userRolesRepo.find({
        //     where: { userId: user.id, tenantId: tenantId },
        //     relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission']
        // });
        return Promise.resolve(true)
        // 检查所需权限是否满足
        // return permissions.some(permission => requiredPermissions.includes(permission.role.rolePermissions.permission.name));
    }
}