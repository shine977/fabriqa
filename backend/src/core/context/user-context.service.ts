import { ExecutionContext, Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ModuleRef } from '@nestjs/core';
import { UserContext } from './user-context';
import { UserEntity } from '@modules/user/entities/user.entity';

@Injectable()
export class UserContextService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly moduleRef: ModuleRef,
  ) {}

  getContext(): UserEntity {
    const context = UserContext.getContext();
    if (!context) {
      throw new NotFoundException('User context not found');
    }
    const user = context.getUser();
    if (!user) {
      throw new NotFoundException('User not found in context');
    }
    return user;
  }

  isSuperAdmin(): boolean {
    const context = UserContext.getContext();
    return context?.isSuperAdmin ?? false;
  }

  hasPermission(permission: string): boolean {
    const context = UserContext.getContext();
    return context?.hasPermission(permission) ?? false;
  }

  async getUserById(id: string): Promise<UserEntity | null> {
    const cacheKey = `user:${id}`;
    const cachedUser = await this.cacheManager.get<UserEntity>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (user) {
      await this.cacheManager.set(cacheKey, user, 3600000); // 1 hour
    }

    return user;
  }

  async clearUserCache(id: string): Promise<void> {
    await this.cacheManager.del(`user:${id}`);
  }
}
