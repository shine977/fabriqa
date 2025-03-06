import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BasePermissionGuard } from './base.permission.guard';
import { UserContext } from '../../context';
import { DATA_PERMISSION_KEY } from '../decorators/data.permission.decorator';

@Injectable()
export class DataPermissionGuard extends BasePermissionGuard {
  readonly logger = new Logger('DataPermissionGuard');

  constructor(reflector: Reflector) {
    super(reflector);
  }

  protected async checkPermission(context: ExecutionContext, userContext: UserContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(DATA_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      this.logger.debug('No data permissions required');
      return true;
    }

    this.logger.debug(`Checking data permissions: ${requiredPermissions.join(', ')}`);
    return userContext.hasAnyPermission(requiredPermissions);
  }
}
