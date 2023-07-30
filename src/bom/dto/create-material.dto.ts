import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMaterialDto {
  @IsOptional()
  price: number;
  @IsNotEmpty()
  name: string;
  @IsOptional()
  type: string;
  @IsOptional()
  code: string;
  @IsNotEmpty()
  color: string;
  @IsNotEmpty()
  vendor: string;
  @IsOptional()
  picture: string;
  @IsNotEmpty()
  grade: string;
}
