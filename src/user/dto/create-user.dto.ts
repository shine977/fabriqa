import { IsEmpty, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @IsNotEmpty()
  @IsString()
  password: string;
  @IsOptional()
  email: string;
}
