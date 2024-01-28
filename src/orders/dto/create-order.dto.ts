import { OrderItemEntity } from '../entities/order-item.entity';

export class CreateOrderDto {
  delivery: Date;

  materials?: [];
  items: OrderItemEntity[];

  amount: number;
  purchaseDate: Date;
}
