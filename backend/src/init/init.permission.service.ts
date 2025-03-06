// src/init/init.permission.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { PermissionEntity } from '@modules/permission/entities/permission.entity';
import { Permissions } from '@shared/constants/permission.constants';
import { PermissionType, PermissionScope } from '@shared/enum/permission.enum';

/**
 * Service responsible for initializing and synchronizing permissions in the system
 */
@Injectable()
export class InitPermissionService {
  private readonly logger = new Logger(InitPermissionService.name);

  constructor(
    @InjectRepository(PermissionEntity)
    private permissionRepo: Repository<PermissionEntity>,
  ) {}

  /**
   * Synchronize permissions with the database
   * This method will:
   * 1. Create new permissions that don't exist
   * 2. Update existing permissions
   * 3. Keep track of all changes
   */
  async syncPermissions(): Promise<void> {
    try {
      const permissions = Permissions.getAllPermissions();
      const codes = permissions.map(p => p.code);

      // Fetch existing permissions
      const existingPerms = await this.permissionRepo.find({
        where: { code: In(codes) },
      });
      const existingCodes = new Set(existingPerms.map(p => p.code));

      // Split permissions into update and create arrays
      const toUpdate = permissions.filter(p => existingCodes.has(p.code));
      const toCreate = permissions.filter(p => !existingCodes.has(p.code));

      // Create new permissions in batches
      if (toCreate.length > 0) {
        const batchSize = 50;
        for (let i = 0; i < toCreate.length; i += batchSize) {
          const batch = toCreate.slice(i, i + batchSize);
          const permEntities = batch.map(permission =>
            this.permissionRepo.create({
              code: permission.code,
              name: permission.name,
              type: this.getPermissionType(permission.code),
              scope: PermissionScope.GLOBAL,
              description: `Permission for ${permission.name}`,
              isEnabled: true,
              orderNum: this.calculateOrderNum(permission.code),
              metadata: {
                module: permission.module,
                createdAt: new Date().toISOString(),
                lastSyncAt: new Date().toISOString(),
              } as any,
            }),
          );

          await this.permissionRepo.save(permEntities);
          this.logger.log(`Created ${batch.length} permissions (batch ${i / batchSize + 1})`);
        }
      }

      // Update existing permissions in batches
      if (toUpdate.length > 0) {
        const batchSize = 50;
        for (let i = 0; i < toUpdate.length; i += batchSize) {
          const batch = toUpdate.slice(i, i + batchSize);
          await Promise.all(
            batch.map(permission =>
              this.permissionRepo.update(
                { code: permission.code },
                {
                  name: permission.name,
                  description: `Permission for ${permission.name}`,
                  metadata: {
                    module: permission.module,
                    lastSyncAt: new Date().toISOString(),
                  } as any,
                },
              ),
            ),
          );
          this.logger.log(`Updated ${batch.length} permissions (batch ${i / batchSize + 1})`);
        }
      }

      this.logger.log(`Permission sync completed. Created: ${toCreate.length}, Updated: ${toUpdate.length}`);
    } catch (error) {
      this.logger.error('Failed to sync permissions:', error);
      throw error;
    }
  }

  /**
   * Determine permission type based on the permission code
   * @param code Permission code
   * @returns PermissionType
   */
  private getPermissionType(code: string): PermissionType {
    const operation = code.split(':')[2];
    switch (operation) {
      case 'view':
      case '*':
        return PermissionType.MENU;
      case 'create':
      case 'update':
      case 'delete':
        return PermissionType.API;
      case 'export':
      case 'import':
        return PermissionType.BUTTON;
      default:
        return PermissionType.API;
    }
  }

  /**
   * Calculate order number for permission sorting
   * @param code Permission code
   * @returns number
   */
  private calculateOrderNum(code: string): number {
    const [module, subModule, operation] = code.split(':');
    const moduleWeight = this.getModuleWeight(module);
    const subModuleWeight = this.getSubModuleWeight(subModule);
    const operationWeight = this.getOperationWeight(operation);

    return moduleWeight * 10000 + subModuleWeight * 100 + operationWeight;
  }

  private getModuleWeight(module: string): number {
    const weights: Record<string, number> = {
      system: 1,
      auth: 2,
      order: 3,
      bom: 4,
      supplier: 5,
      factory: 6,
      receiving: 7,
      delivery: 8,
      statement: 9,
      resource: 10,
      policy: 11,
      file: 12,
    };
    return weights[module] || 99;
  }

  private getSubModuleWeight(subModule: string): number {
    const weights: Record<string, number> = {
      base: 1,
      user: 2,
      role: 3,
      menu: 4,
      login: 5,
      token: 6,
    };
    return weights[subModule] || 50;
  }

  private getOperationWeight(operation: string): number {
    const weights: Record<string, number> = {
      '*': 1,
      view: 2,
      create: 3,
      update: 4,
      delete: 5,
      approve: 6,
      export: 7,
      import: 8,
    };
    return weights[operation] || 99;
  }
}
