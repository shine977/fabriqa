import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CustomerType } from '../entities/customer.entity';

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(CustomerType)
  type: CustomerType;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
