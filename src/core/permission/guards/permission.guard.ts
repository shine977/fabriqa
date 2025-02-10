import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BasePermissionGuard } from './base.permission.guard';
import { UserContext } from '../../context';
import { PERMISSIONS_KEY } from '../decorators/require.permissions.decorator';

@Injectable()
export class PermissionGuard extends BasePermissionGuard {
  readonly logger = new Logger('PermissionGuard');

  constructor(reflector: Reflector) {
    super(reflector);
  }

  protected async checkPermission(context: ExecutionContext, userContext: UserContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      this.logger.debug('No permissions required');
      return true;
    }

    this.logger.debug(`Checking permissions: ${requiredPermissions.join(', ')}`);
    return userContext.hasAllPermissions(requiredPermissions);
  }
}
