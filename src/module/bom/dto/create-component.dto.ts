import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePartDto {
  @IsNotEmpty()
  @IsNumber()
  processingCost: number;

  @IsOptional()
  @IsNumber()
  moldCost: number;

  @IsOptional()
  @IsNumber()
  designCost: number;

  @IsOptional()
  @IsNumber()
  gramWeight: number;
}
