import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { OrderItemEntity } from './entities/order-item.entity';
import * as dayjs from 'dayjs';
import { ContextService } from 'src/service/context.service';
import { add, unaryPlus } from 'mathjs';
import { unifyResponse } from 'src/common/utils/unifyResponse';
@Injectable()
export class OrdersService {
  constructor(
    private context: ContextService,
    private dataSource: DataSource,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orederItemRepository: Repository<OrderItemEntity>,


  ) { }
  async create(createOrderDto: CreateOrderDto) {

    const criteria = await this.context.buildTenantCriteria()
    const amount = createOrderDto.items.reduce((memo, next) => add(memo, next.amount || 0), 0)
    const hasExistedOrder = await this.orderRepository.find({ where: { taskOrderNo: createOrderDto.taskOrderNo } })
    console.log('hasExistedOrder', hasExistedOrder)
    if (hasExistedOrder.length) {
      return unifyResponse(-1, '订单已存在，请不要重复导入！')
    }
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      const order = await queryRunner.manager.save(OrderEntity, {
        purchaseDate: createOrderDto.purchaseDate,
        orderNo: createOrderDto.orderNumber,
        paymentClause: createOrderDto.paymentClause,
        taskOrderNo: createOrderDto.taskOrderNo,
        amount,
        delivery: createOrderDto.delivery,
        customer: createOrderDto.customer,
        ...criteria,

      })

      const orderItems = createOrderDto.items.map(item => {
        return {
          ...item,
          order: order
        }
      })
      const items = await queryRunner.manager.save(OrderItemEntity, orderItems)
      await queryRunner.commitTransaction();
      return unifyResponse({ item: { ...order, items } })
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'There was a problem creating users',
      }, HttpStatus.INTERNAL_SERVER_ERROR)
    } finally {
      await queryRunner.release()
    }

  }

  async findAll(query) {
    const criteria = await this.context.buildTenantCriteria()
    const qb = await this.orderRepository.createQueryBuilder('order')

    await qb.leftJoinAndSelect('order.children', 'item')
    qb.andWhere("order.tenant_id= :tenantId", { tenantId: criteria.tenantId })
    const [items, total] = await qb.offset((query.current - 1) * query.pageSize)
      .limit(query.pageSize)
      .getManyAndCount();
    return unifyResponse({ items, total });

  }
  async findAllItems() {
    const [results, total] = await this.orederItemRepository.findAndCount({
      take: 10,
      skip: 0,
    });
    return { items: results, total };
  }
  async findOne(id: number) {
    const item = await this.orderRepository.find(
      {
        relations: {
          children: true,
        },
        where: { ...await this.context.buildTenantCriteria(id) }
      }
    )
    return unifyResponse({ item })
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const item = await this.orderRepository.update(await this.context.buildTenantCriteria(id), updateOrderDto);
    return unifyResponse({ item })
  }

  async remove(id: number) {
    const item = await this.orderRepository.softDelete(await this.context.buildTenantCriteria(id));
    return unifyResponse({ item })
  }
}
