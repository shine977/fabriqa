import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserContext } from '../../context';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/public.decorator';

@Injectable()
export abstract class BasePermissionGuard implements CanActivate {
  readonly logger = new Logger('BasePermissionGuard');

  constructor(protected readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // 检查是否是公共路由
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (isPublic) {
        return true;
      }
      return this.validateRequest(context);
    } catch (error) {
      this.logger.error(`Permission validation failed: ${error.message}`);
      throw error;
    }
  }

  protected async validateRequest(context: ExecutionContext): Promise<boolean> {
    const userContext = UserContext.getContext();
    if (!userContext) {
      this.logger.error('No user context found');
      throw new UnauthorizedException('用户上下文未找到');
    }

    const user = userContext.getUser();
    if (!user) {
      this.logger.error('No user found in context');
      throw new UnauthorizedException('用户未认证');
    }

    // 超级管理员直接放行
    if (userContext.isSuperAdmin) {
      this.logger.debug('Super admin access granted');
      return true;
    }

    return this.checkPermission(context, userContext);
  }

  protected abstract checkPermission(context: ExecutionContext, userContext: UserContext): Promise<boolean>;
}
