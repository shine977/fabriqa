import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, DataSource } from 'typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AdvancedLog } from '../../shared/decorators/advanced-logger.decorator';
import { PermissionType } from '@shared/enum/permission.enum';
import { BaseService, CacheService } from 'src/core/cache';
import { PluginService } from '@core/plugin';

@Injectable()
export class PermissionService extends BaseService {
  private treeRepository: TreeRepository<PermissionEntity>;

  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
    private dataSource: DataSource,
    protected readonly cacheService: CacheService,
  ) {
    super(cacheService, 'permission');
    this.treeRepository = this.dataSource.getTreeRepository(PermissionEntity);
  }

  private getCacheKey(key: string) {
    return `${this.cachePrefix}:${key}`;
  }

  async create(createPermissionDto: CreatePermissionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 检查权限码是否已存在
      const exists = await this.permissionRepository.findOne({
        where: { code: createPermissionDto.code },
      });
      if (exists) {
        throw new BadRequestException(`Permission code ${createPermissionDto.code} already exists`);
      }

      const permission = this.permissionRepository.create(createPermissionDto);

      if (createPermissionDto.parentId) {
        const parent = await this.permissionRepository.findOne({
          where: { id: createPermissionDto.parentId },
        });
        if (!parent) {
          throw new NotFoundException(`Parent permission not found`);
        }
        permission.parent = parent;
      }

      const result = await queryRunner.manager.save(permission);
      await queryRunner.commitTransaction();

      // 清除缓存
      await this.clearModuleCache();

      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  @AdvancedLog({
    context: 'PermissionService',
    // logParams: { result: true, timing: true },
  })
  async findAll() {
    const cacheKey = this.getCacheKey('list');
    const cached = await this.getCacheData<PermissionEntity[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const permissions = await this.permissionRepository.find({
      order: {
        orderNum: 'ASC',
        createdAt: 'DESC',
      },
    });

    await this.setCacheData(cacheKey, permissions);
    return permissions;
  }

  @AdvancedLog({
    context: 'PermissionService',
    logParams: { result: true, timing: true },
  })
  async findTree() {
    const cacheKey = this.getCacheKey('tree');
    const cached = await this.getCacheData<PermissionEntity[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const trees = await this.treeRepository.findTrees();
    await this.setCacheData(cacheKey, trees);
    return trees;
  }

  @AdvancedLog({
    context: 'PermissionService',
    logParams: { result: true, timing: true },
  })
  async findByType(type: PermissionType) {
    const cacheKey = this.getCacheKey(`type:${type}`);
    const cached = await this.getCacheData<PermissionEntity[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const permissions = await this.permissionRepository.find({
      where: { type },
      order: { orderNum: 'ASC' },
    });

    await this.setCacheData(cacheKey, permissions);
    return permissions;
  }

  @AdvancedLog({
    context: 'PermissionService',
    logParams: { result: true, error: true },
  })
  async findOne(id: string) {
    const cacheKey = this.getCacheKey(`id:${id}`);
    const cached = await this.getCacheData<PermissionEntity>(cacheKey);

    if (cached) {
      return cached;
    }

    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'roles'],
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    await this.setCacheData(cacheKey, permission);
    return permission;
  }

  @AdvancedLog({
    context: 'PermissionService',
    logParams: { result: true, error: true, timing: true },
  })
  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const permission = await this.findOne(id);
      Object.assign(permission, updatePermissionDto);

      if (updatePermissionDto.parentId) {
        const parent = await this.permissionRepository.findOne({
          where: { id: updatePermissionDto.parentId },
        });
        if (!parent) {
          throw new NotFoundException(`Parent permission not found`);
        }
        permission.parent = parent;
      }

      const result = await queryRunner.manager.save(permission);
      await queryRunner.commitTransaction();

      // 清除所有相关缓存
      await this.clearModuleCache();

      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  @AdvancedLog({
    context: 'PermissionService',
    logParams: { result: true, error: true },
  })
  async remove(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const permission = await this.findOne(id);

      // 检查是否有子权限
      const children = await this.treeRepository.findDescendants(permission);
      if (children.length > 1) {
        // 大于1是因为findDescendants会包含自身
        throw new BadRequestException('Cannot delete permission with children');
      }

      const result = await queryRunner.manager.remove(permission);
      await queryRunner.commitTransaction();

      // 清除所有相关缓存
      await this.clearModuleCache();

      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
