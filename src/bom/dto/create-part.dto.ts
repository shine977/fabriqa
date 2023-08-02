import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePartDto {
  @IsNotEmpty()
  @IsNumber()
  processingFee: number;

  @IsOptional()
  @IsNumber()
  moldFee: number;

  @IsOptional()
  @IsNumber()
  designFee: number;

  @IsNotEmpty()
  @IsNumber()
  gramWeight: number;

  @IsNotEmpty()
  @IsNumber()
  sampleWeight: number;
}
