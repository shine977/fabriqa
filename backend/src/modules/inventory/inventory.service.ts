import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InventoryEntity, InventoryStatus } from './entities/inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryTransactionEntity, TransactionType } from './entities/inventory-transaction.entity';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { UserContext } from '@core/context';
import { unifyResponse } from '@shared/utils/unifyResponse';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MaterialEntity } from '@modules/bom/entities/material.entity';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly userContext: UserContext,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
    @InjectRepository(InventoryTransactionEntity)
    private readonly transactionRepository: Repository<InventoryTransactionEntity>,
    @InjectRepository(MaterialEntity)
    private readonly materialRepository: Repository<MaterialEntity>,
  ) {}

  private buildTenantCriteria(id?: string) {
    const criteria: any = {};
    const tenantId = this.userContext.tenantId;

    if (tenantId) {
      criteria.tenantId = tenantId;
    }

    if (id) {
      criteria.id = id;
    }

    return criteria;
  }

  /**
   * 创建库存记录
   */
  async create(createInventoryDto: CreateInventoryDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 设置默认值
      if (createInventoryDto.availableQuantity === undefined) {
        createInventoryDto.availableQuantity = createInventoryDto.quantity;
      }

      if (createInventoryDto.totalCost === undefined && createInventoryDto.unitCost !== undefined) {
        createInventoryDto.totalCost = createInventoryDto.unitCost * createInventoryDto.quantity;
      }

      // 检查物料是否存在
      const material = await this.materialRepository.findOne({
        where: { id: createInventoryDto.materialId },
      });

      if (!material) {
        throw new HttpException('物料不存在', HttpStatus.BAD_REQUEST);
      }

      // 检查是否已存在相同物料和批次的库存
      const existingInventory = await this.inventoryRepository.findOne({
        where: {
          materialId: createInventoryDto.materialId,
          factoryId: createInventoryDto.factoryId,
          batchNumber: createInventoryDto.batchNumber,
          tenantId: this.userContext.tenantId,
        },
      });

      let inventory: InventoryEntity;

      if (existingInventory) {
        // 更新现有库存
        existingInventory.quantity += createInventoryDto.quantity;
        existingInventory.availableQuantity += createInventoryDto.availableQuantity;
        
        if (createInventoryDto.unitCost) {
          // 加权平均成本计算
          const totalValue = existingInventory.totalCost + (createInventoryDto.unitCost * createInventoryDto.quantity);
          const totalQuantity = existingInventory.quantity;
          existingInventory.unitCost = totalValue / totalQuantity;
          existingInventory.totalCost = totalValue;
        }

        inventory = await queryRunner.manager.save(existingInventory);
      } else {
        // 创建新库存
        const newInventory = this.inventoryRepository.create({
          ...createInventoryDto,
          tenantId: this.userContext.tenantId,
        });
        inventory = await queryRunner.manager.save(newInventory);
      }

      // 创建库存交易记录
      const transaction = this.transactionRepository.create({
        transactionType: TransactionType.PURCHASE,
        quantity: createInventoryDto.quantity,
        beforeQuantity: existingInventory ? existingInventory.quantity - createInventoryDto.quantity : 0,
        afterQuantity: inventory.quantity,
        unitCost: createInventoryDto.unitCost,
        totalCost: createInventoryDto.quantity * (createInventoryDto.unitCost || 0),
        remarks: createInventoryDto.remarks || '初始库存',
        inventoryId: inventory.id,
        operatorId: this.userContext.userId
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      // 发送库存创建事件
      this.eventEmitter.emit('inventory.created', inventory);

      return unifyResponse({ item: inventory });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`创建库存失败: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 查询库存列表
   */
  async findAll(query: InventoryQueryDto) {
    const qb = this.inventoryRepository.createQueryBuilder('inventory');
    
    // 关联物料和工厂
    qb.leftJoinAndSelect('inventory.material', 'material')
      .leftJoinAndSelect('inventory.factory', 'factory');

    // 租户过滤
    const criteria = this.buildTenantCriteria();
    qb.andWhere('inventory.tenant_id = :tenantId', { tenantId: criteria.tenantId });

    // 条件过滤
    if (query.materialId) {
      qb.andWhere('inventory.material_id = :materialId', { materialId: query.materialId });
    }

    if (query.materialCode) {
      qb.andWhere('material.code = :materialCode', { materialCode: query.materialCode });
    }

    if (query.materialName) {
      qb.andWhere('material.name LIKE :materialName', { materialName: `%${query.materialName}%` });
    }

    if (query.factoryId) {
      qb.andWhere('inventory.factory_id = :factoryId', { factoryId: query.factoryId });
    }

    if (query.location) {
      qb.andWhere('inventory.location LIKE :location', { location: `%${query.location}%` });
    }

    if (query.batchNumber) {
      qb.andWhere('inventory.batch_number = :batchNumber', { batchNumber: query.batchNumber });
    }

    if (query.status) {
      qb.andWhere('inventory.status = :status', { status: query.status });
    }

    if (query.isLow) {
      qb.andWhere('inventory.quantity <= inventory.min_quantity');
    }

    // 分页
    const page = query.current || 1;
    const pageSize = query.pageSize || 10;
    
    const [items, total] = await qb
      .orderBy('inventory.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return unifyResponse({ items, total });
  }

  /**
   * 查询单个库存
   */
  async findOne(id: string) {
    const inventory = await this.inventoryRepository.findOne({
      where: this.buildTenantCriteria(id),
      relations: ['material', 'factory'],
    });

    if (!inventory) {
      throw new HttpException('库存不存在', HttpStatus.NOT_FOUND);
    }

    return unifyResponse({ item: inventory });
  }

  /**
   * 更新库存
   */
  async update(id: string, updateInventoryDto: UpdateInventoryDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await this.inventoryRepository.findOne({
        where: this.buildTenantCriteria(id),
      });

      if (!inventory) {
        throw new HttpException('库存不存在', HttpStatus.NOT_FOUND);
      }

      // 记录更新前的数量
      const beforeQuantity = inventory.quantity;

      // 更新库存
      Object.assign(inventory, updateInventoryDto);

      // 如果数量有变化，创建调整交易记录
      if (updateInventoryDto.quantity !== undefined && updateInventoryDto.quantity !== beforeQuantity) {
        const transaction = this.transactionRepository.create({
          transactionType: TransactionType.ADJUSTMENT,
          quantity: updateInventoryDto.quantity - beforeQuantity,
          beforeQuantity,
          afterQuantity: updateInventoryDto.quantity,
          unitCost: inventory.unitCost,
          totalCost: (updateInventoryDto.quantity - beforeQuantity) * inventory.unitCost,
          remarks: '手动调整库存',
          inventoryId: inventory.id,
          operatorId: this.userContext.userId
        });

        await queryRunner.manager.save(transaction);
      }

      const updatedInventory = await queryRunner.manager.save(inventory);
      await queryRunner.commitTransaction();

      // 发送库存更新事件
      this.eventEmitter.emit('inventory.updated', updatedInventory);

      return unifyResponse({ item: updatedInventory });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`更新库存失败: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 删除库存
   */
  async remove(id: string) {
    const inventory = await this.inventoryRepository.findOne({
      where: this.buildTenantCriteria(id),
    });

    if (!inventory) {
      throw new HttpException('库存不存在', HttpStatus.NOT_FOUND);
    }

    // 软删除库存
    await this.inventoryRepository.softDelete(id);

    // 发送库存删除事件
    this.eventEmitter.emit('inventory.deleted', inventory);

    return unifyResponse({ success: true });
  }

  /**
   * 创建库存交易
   */
  async createTransaction(createTransactionDto: CreateInventoryTransactionDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await this.inventoryRepository.findOne({
        where: { 
          id: createTransactionDto.inventoryId,
          tenantId: this.userContext.tenantId 
        },
      });

      if (!inventory) {
        throw new HttpException('库存不存在', HttpStatus.NOT_FOUND);
      }

      // 记录交易前数量
      const beforeQuantity = inventory.quantity;
      let afterQuantity = beforeQuantity;

      // 根据交易类型更新库存
      switch (createTransactionDto.transactionType) {
        case TransactionType.PURCHASE:
        case TransactionType.RETURN:
        case TransactionType.PRODUCTION:
          // 入库操作
          afterQuantity = beforeQuantity + createTransactionDto.quantity;
          inventory.quantity = afterQuantity;
          inventory.availableQuantity += createTransactionDto.quantity;
          break;
        
        case TransactionType.SALES:
        case TransactionType.CONSUMPTION:
        case TransactionType.SCRAP:
          // 出库操作
          if (inventory.availableQuantity < createTransactionDto.quantity) {
            throw new HttpException('可用库存不足', HttpStatus.BAD_REQUEST);
          }
          afterQuantity = beforeQuantity - createTransactionDto.quantity;
          inventory.quantity = afterQuantity;
          inventory.availableQuantity -= createTransactionDto.quantity;
          break;
        
        case TransactionType.TRANSFER:
          // 转移操作 - 库存数量不变，只记录交易
          break;
        
        case TransactionType.ADJUSTMENT:
          // 调整操作
          afterQuantity = beforeQuantity + createTransactionDto.quantity;
          inventory.quantity = afterQuantity;
          inventory.availableQuantity = inventory.availableQuantity + createTransactionDto.quantity;
          break;
      }

      // 更新库存
      await queryRunner.manager.save(inventory);

      // 创建交易记录
      const transaction = this.transactionRepository.create({
        ...createTransactionDto,
        beforeQuantity,
        afterQuantity,
        totalCost: createTransactionDto.quantity * (createTransactionDto.unitCost || inventory.unitCost || 0),
        operatorId: this.userContext.userId
      });

      const savedTransaction = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      // 发送库存交易事件
      this.eventEmitter.emit('inventory.transaction.created', savedTransaction);

      return unifyResponse({ item: savedTransaction });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`创建库存交易失败: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 查询库存交易记录
   */
  async findTransactions(inventoryId: string, page = 1, pageSize = 10) {
    const [items, total] = await this.transactionRepository.findAndCount({
      where: {
        inventoryId
      },
      relations: ['operator'],
      order: {
        createdAt: 'DESC'
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return unifyResponse({ items, total });
  }

  /**
   * 获取库存预警列表
   */
  async getLowStockItems() {
    const items = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.material', 'material')
      .leftJoinAndSelect('inventory.factory', 'factory')
      .where('inventory.tenant_id = :tenantId', { tenantId: this.userContext.tenantId })
      .andWhere('inventory.quantity <= inventory.min_quantity')
      .getMany();

    return unifyResponse({ items, total: items.length });
  }

  /**
   * 获取库存统计信息
   */
  async getInventoryStats() {
    const totalQuery = this.inventoryRepository.createQueryBuilder('inventory')
      .where('inventory.tenant_id = :tenantId', { tenantId: this.userContext.tenantId });
    
    const totalCount = await totalQuery.getCount();
    
    const lowStockCount = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.tenant_id = :tenantId', { tenantId: this.userContext.tenantId })
      .andWhere('inventory.quantity <= inventory.min_quantity')
      .getCount();
    
    const totalValue = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('SUM(inventory.total_cost)', 'totalValue')
      .where('inventory.tenant_id = :tenantId', { tenantId: this.userContext.tenantId })
      .getRawOne();

    return unifyResponse({
      totalCount,
      lowStockCount,
      totalValue: totalValue?.totalValue || 0,
    });
  }

  /**
   * 预留库存
   */
  async reserveInventory(inventoryId: string, quantity: number, referenceNo?: string, referenceType?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await this.inventoryRepository.findOne({
        where: { 
          id: inventoryId,
          tenantId: this.userContext.tenantId 
        },
      });

      if (!inventory) {
        throw new HttpException('库存不存在', HttpStatus.NOT_FOUND);
      }

      if (inventory.availableQuantity < quantity) {
        throw new HttpException('可用库存不足', HttpStatus.BAD_REQUEST);
      }

      // 更新库存预留数量
      inventory.reservedQuantity += quantity;
      inventory.availableQuantity -= quantity;

      await queryRunner.manager.save(inventory);

      // 创建预留交易记录
      const transaction = this.transactionRepository.create({
        transactionType: TransactionType.TRANSFER,
        quantity,
        beforeQuantity: inventory.quantity,
        afterQuantity: inventory.quantity,
        unitCost: inventory.unitCost,
        totalCost: quantity * (inventory.unitCost || 0),
        referenceNo,
        referenceType,
        remarks: '库存预留',
        inventoryId: inventory.id,
        operatorId: this.userContext.userId
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return unifyResponse({ success: true });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`预留库存失败: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 取消预留库存
   */
  async cancelReservation(inventoryId: string, quantity: number, referenceNo?: string, referenceType?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await this.inventoryRepository.findOne({
        where: { 
          id: inventoryId,
          tenantId: this.userContext.tenantId 
        },
      });

      if (!inventory) {
        throw new HttpException('库存不存在', HttpStatus.NOT_FOUND);
      }

      if (inventory.reservedQuantity < quantity) {
        throw new HttpException('预留库存不足', HttpStatus.BAD_REQUEST);
      }

      // 更新库存预留数量
      inventory.reservedQuantity -= quantity;
      inventory.availableQuantity += quantity;

      await queryRunner.manager.save(inventory);

      // 创建取消预留交易记录
      const transaction = this.transactionRepository.create({
        transactionType: TransactionType.TRANSFER,
        quantity,
        beforeQuantity: inventory.quantity,
        afterQuantity: inventory.quantity,
        unitCost: inventory.unitCost,
        totalCost: quantity * (inventory.unitCost || 0),
        referenceNo,
        referenceType,
        remarks: '取消库存预留',
        inventoryId: inventory.id,
        operatorId: this.userContext.userId
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return unifyResponse({ success: true });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`取消预留库存失败: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
