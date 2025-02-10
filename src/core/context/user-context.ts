import { Injectable, Logger, Scope } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { AsyncLocalStorage } from 'async_hooks';
import { Request } from 'express';

import { Context } from './context';
import { RequestUser } from 'src/types/user.interface';
import { UserEntity } from '@modules/user/entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class UserContext extends Context {
  private static readonly storage = new AsyncLocalStorage<UserContext>();
  private static readonly logger = new Logger('UserContext');
  protected user: UserEntity;

  constructor(private readonly moduleRef: ModuleRef) {
    super();
  }

  setUser(user: UserEntity): void {
    this.user = user;
    UserContext.logger.debug(`Setting user in context ${this.instanceId}: ${user?.id}`);
  }

  getUser(): UserEntity | null {
    UserContext.logger.debug(`Getting user from context ${this.instanceId}: ${this.user?.id}`);
    return this.user;
  }

  // 用户相关的便捷方法
  get isSuperAdmin(): boolean {
    return this.user?.username === 'root';
  }

  get userId(): string | null {
    return this.user?.id || null;
  }

  get username(): string | null {
    return this.user?.username || null;
  }

  get tenantId(): string | null {
    return this.user?.tenantId || null;
  }

  get permissions(): string[] {
    return [];
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  static getContext(): UserContext | undefined {
    const context = this.storage.getStore();
    this.logger.debug(`Getting global context: ${context?.getId()}`);
    return context;
  }

  static async createContext(req: Request, moduleRef: ModuleRef): Promise<UserContext> {
    const contextId = ContextIdFactory.getByRequest(req);
    const context = await moduleRef.resolve<UserContext>(UserContext, contextId, { strict: false });

    if (req.user) {
      context.setUser(req.user as UserEntity);
    }

    return context;
  }

  static async runWithContext<T>(context: UserContext, fn: () => Promise<T> | T): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.storage.run(context, async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
  static runInContext<T>(context: UserContext, fn: () => T): T {
    return this.storage.run(context, fn);
  }
}
