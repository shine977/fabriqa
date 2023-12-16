import { Inject, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { OrderItemEntity } from './entities/order-item.entity';
import * as dayjs from 'dayjs';
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orederItemRepository: Repository<OrderItemEntity>,
    @Inject(REQUEST) private readonly request: Request,
  ) {}
  create(createOrderDto: CreateOrderDto) {
    const orderNo = dayjs(Date.now(), 'YYYYMMDDHHmmss');
    return this.orderRepository.save({ tenantId: this.request.params.tenantId, ...createOrderDto });
  }

  async findAll() {
    const [results, total] = await this.orederItemRepository.findAndCount({
      take: 10,
      skip: 0,
      where: { tenantId: this.request.params.tenantId, orderNo: this.request.params.orderNo },
    });
    return { items: results, total };
  }
  async findAllItems() {
    const [results, total] = await this.orederItemRepository.findAndCount({
      take: 10,
      skip: 0,
    });
    return { items: results, total };
  }
  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
