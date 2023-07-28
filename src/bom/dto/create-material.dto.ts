import { IsOptional } from 'class-validator';

export class CreateMaterialDto {
  @IsOptional()
  price: number;
  name: string;
  @IsOptional()
  type: string;
  code: string;
  color: string;
  vendor: string;
  @IsOptional()
  picture: string;
}
