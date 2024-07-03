import { IsNotEmpty } from 'class-validator';
import { OrderItemEntity } from '../entities/order-item.entity';

export class OrderItemDto {

  taskOrderNo?: string
  quantity: number
  amount: number

  unitPrice: number
  specification: string
  @IsNotEmpty()
  name: string
  materialNo: string
  materialCode: string
  delivery: string
  orderId?: number

}

export class CreateOrderDto {
  orderNumber: string
  purchaseDate: string
  items: OrderItemDto[]
  paymentClause: string
  taskOrderNo: string
  delivery: string
  customer: string

}
