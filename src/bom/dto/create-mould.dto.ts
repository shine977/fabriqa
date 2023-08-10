import { IsNotEmpty } from 'class-validator';
import { ComponentEntity } from '../entities/component.entity';
import { CustomerEntity } from 'src/customers/entities/customer.entity';

export class CreateMouldDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  xoutx: string;

  parts: Array<ComponentEntity>;
  customer: CustomerEntity;
}
