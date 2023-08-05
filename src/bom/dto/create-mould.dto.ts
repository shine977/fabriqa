import { IsNotEmpty } from 'class-validator';
import { PartEntity } from '../entities/part.entity';
import { CustomerEntity } from 'src/customers/entities/customer.entity';

export class CreateMouldDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  xoutx: string;

  parts: Array<PartEntity>;
  customer: CustomerEntity;
}
