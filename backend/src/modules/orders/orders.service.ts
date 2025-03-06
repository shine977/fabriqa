import { HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { DataSource, Repository, QueryRunner } from 'typeorm';
import { OrderItemEntity } from './entities/order-item.entity';
import * as dayjs from 'dayjs';
import { unifyResponse } from '@shared/utils/unifyResponse';
import { FieldTemplateEntity, FieldTemplateService, FieldValidationService } from '@core/dynamic-field';
import { OrderPlugin } from 'src/plugins/order/order.plugin';
import { OrderDynamicFieldsConfig, OrderValidationContext, OrderWithTemplate } from './interfaces/order.interface';
import { UserContext } from '@core/context';
import { MATERIAL_TYPE, ORDER_STATUS, ORDER_TYPE, ORDER_DIRECTION } from '@shared/constants/order.constants';
import { FactoryEntity } from '@modules/factories/entities/factory.entity';
import { SupplierEntity } from '@modules/suppliers/entities/supplier.entity';
import { CustomerEntity } from '@modules/customer/entities/customer.entity';

import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { read, utils } from 'xlsx';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    private userContext: UserContext,
    private dataSource: DataSource,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(FactoryEntity)
    private readonly factoryRepo: Repository<FactoryEntity>,
    @InjectRepository(SupplierEntity)
    private readonly supplierRepo: Repository<SupplierEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
    private readonly fieldTemplateService: FieldTemplateService,
    private readonly fieldValidationService: FieldValidationService,
    private readonly orderPlugin: OrderPlugin,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  private buildTenantCriteria(id?: string | number) {
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
  private async getOrderTemplates(
    tenantId: string,
    orderTemplateId?: string,
    itemTemplateId?: string,
  ): Promise<OrderDynamicFieldsConfig> {
    try {
      const [orderTemplate, itemTemplate] = await Promise.all([
        this.fieldTemplateService.findTemplateWithInheritance({
          templateId: orderTemplateId,
          moduleType: 'order',
          tenantId,
        }),
        this.fieldTemplateService.findTemplateWithInheritance({
          templateId: itemTemplateId,
          moduleType: 'order_item',
          tenantId,
        }),
      ]);

      return {
        orderTemplate,
        itemTemplate,
        validationContext: { tenantId },
      };
    } catch (error) {
      this.logger.error(`Error getting order templates: ${error.message}`, error.stack);
      throw new HttpException('Failed to load order templates', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async validateDynamicFields(
    fields: Record<string, any>,
    template: FieldTemplateEntity,
    context: OrderValidationContext,
  ) {
    for (const field of template.fields) {
      const validationResult = await this.fieldValidationService.validateField(field, fields?.[field.name], {
        context,
      });

      if (!validationResult.isValid) {
        throw new HttpException(
          {
            message: `Validation failed for field ${field.name}`,
            errors: validationResult.errors,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  /**
   * Create new order with items
   * @param createOrderDto Order creation data
   * @returns Created order with items
   */
  async create(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate factory
      const factory = await this.factoryRepo.findOneOrFail({
        where: { id: createOrderDto.factoryId },
      });

      // Validate supplier or customer based on order direction
      let supplier: SupplierEntity | null = null;
      let customer: CustomerEntity | null = null;

      if (createOrderDto.direction === ORDER_DIRECTION.INBOUND && createOrderDto.supplierId) {
        supplier = await this.supplierRepo.findOneOrFail({
          where: { id: createOrderDto.supplierId },
        });
      } else if (createOrderDto.direction === ORDER_DIRECTION.OUTBOUND && createOrderDto.customerId) {
        customer = await this.customerRepo.findOneOrFail({
          where: { id: createOrderDto.customerId },
        });
      }

      // Validate dynamic fields if template is specified
      if (createOrderDto.templateId) {
        const tenantId = this.userContext.tenantId;
        const { orderTemplate, itemTemplate } = await this.getOrderTemplates(tenantId, createOrderDto.templateId);

        if (orderTemplate) {
          await this.validateDynamicFields(createOrderDto.dynamicFields, orderTemplate, { tenantId });
        }

        // Validate item templates if they exist
        if (itemTemplate && createOrderDto.items) {
          for (const item of createOrderDto.items) {
            if (item.dynamicFields) {
              await this.validateDynamicFields(item.dynamicFields, itemTemplate, { tenantId });
            }
          }
        }
      }

      // Create order
      const { items: _, ...orderDataWithoutItems } = createOrderDto;
      const orderData: Partial<OrderEntity> = {
        ...orderDataWithoutItems,
        factory,
        supplier,
        customer,
        status: ORDER_STATUS.PROCESSING,
      };

      const order = this.orderRepo.create(orderData);

      // Calculate amounts and create order items
      const { items, totalAmount } = await this.calculateOrderItems(createOrderDto.items, createOrderDto.taxRate);

      order.amount = totalAmount;
      order.items = items;

      // Save order and items
      const savedOrder = await queryRunner.manager.save(order);

      // Run order plugins
      // await this.orderPlugin.beforeOrderCreate(savedOrder);

      await queryRunner.commitTransaction();

      // Emit event for other modules
      this.eventEmitter.emit('order.created', savedOrder);

      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create order: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create order');
    } finally {
      await queryRunner.release();
    }
  }
  /**
   * Import orders from Excel file
   * @param file Excel file buffer
   * @returns Created orders
   */
  async importFromExcel(file: Express.Multer.File): Promise<OrderEntity[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // use plugin to import excel
      const orderDataList = await this.orderPlugin.importExcel(file);

      const orders: OrderEntity[] = [];
      for (const orderData of orderDataList) {
        const order = await this.createOrderFromExcelData(orderData, queryRunner);
        orders.push(order);
      }
      await queryRunner.commitTransaction();
      return orders;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to import orders: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to import orders');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Calculate order items amounts
   */
  private async calculateOrderItems(
    items: CreateOrderItemDto[],
    taxRate: number,
  ): Promise<{
    items: OrderItemEntity[];
    totalAmount: number;
  }> {
    let totalAmount = 0;
    const orderItems = items.map(item => {
      const orderItem = new OrderItemEntity();
      Object.assign(orderItem, item);

      // Calculate amounts
      const itemAmount = item.quantity * item.unitPrice;

      orderItem.totalAmount = itemAmount;

      totalAmount += itemAmount;

      return orderItem;
    });

    return { items: orderItems, totalAmount };
  }

  private async createOrderFromExcelData(orderData: CreateOrderDto, queryRunner: QueryRunner): Promise<OrderEntity> {
    let factory = null;
    let supplier = null;
    let customer = null;

    if (orderData.factoryId) {
      factory = await this.factoryRepo.findOne({
        where: { id: orderData.factoryId },
      });
    }
    if (orderData.supplierId) {
      supplier = await this.supplierRepo.findOne({
        where: { id: orderData.supplierId },
      });
    }
    if (orderData.customerId) {
      customer = await this.customerRepo.findOne({
        where: { id: orderData.customerId },
      });
    }

    const order = new OrderEntity();
    Object.assign(order, {
      ...orderData,
      factory,
      status: ORDER_STATUS.DRAFT,
    });

    const { items, totalAmount } = await this.calculateOrderItems(orderData.items, orderData.taxRate);

    order.amount = totalAmount;
    order.items = items;

    return queryRunner.manager.save(OrderEntity, order);
  }

  async findAll(query) {
    const criteria = this.buildTenantCriteria();
    const qb = await this.orderRepo.createQueryBuilder('order');

    await qb.leftJoinAndSelect('order.children', 'item');
    qb.andWhere('order.tenant_id= :tenantId', { tenantId: criteria.tenantId });
    const [items, total] = await qb
      .offset((query.current - 1) * query.pageSize)
      .limit(query.pageSize)
      .getManyAndCount();
    return unifyResponse({ items, total });
  }
  async findAllItems() {
    const [items, total] = await this.orderItemRepository.findAndCount({
      take: 10,
      skip: 0,
    });
    return { items, total };
  }
  async findOne(id: string, query) {
    const item = await this.orderRepo.find({
      relations: {
        items: true,
      },
      where: { ...this.buildTenantCriteria(id) },
    });
    return unifyResponse({ item });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const item = await this.orderRepo.update(await this.buildTenantCriteria(id), updateOrderDto);
    return unifyResponse({ item });
  }

  async remove(id: string) {
    const item = await this.orderRepo.softDelete(this.buildTenantCriteria(id));
    return unifyResponse({ item });
  }

  /**
   * Get order with its template and items
   */
  async getOrderWithTemplate(id: string): Promise<OrderWithTemplate> {
    const criteria = this.buildTenantCriteria();
    const { tenantId } = criteria;

    try {
      // 获取订单及其项目
      const order = await this.orderRepo.findOne({
        where: { id },
        relations: ['children'],
      });

      if (!order) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }

      // 获取模板
      const { orderTemplate, itemTemplate } = await this.getOrderTemplates(tenantId, order.templateId);

      // 应用插件钩子
      const processedTemplate = await this.orderPlugin.onTemplateLoad(orderTemplate, { context: { tenantId } });

      // 处理订单项目的模板
      const items = await Promise.all(
        order.items.map(async item => ({
          item,
          template: await this.orderPlugin.onTemplateLoad(itemTemplate, { context: { tenantId } }),
        })),
      );

      return {
        order,
        template: processedTemplate,
        items,
      };
    } catch (error) {
      this.logger.error(`Error getting order with template: ${error.message}`, error.stack);
      throw error;
    }
  }
}
