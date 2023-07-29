import { IsOptional } from 'class-validator';

export class CreateUserDto {
  uid: string;
  username: string;
  password: string;
  @IsOptional()
  email: string;
}
