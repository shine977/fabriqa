import { IsEmpty, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  password: string;

  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: '是否为管理员', default: false })
  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;

  @ApiProperty({ description: '管理员等级 (1-5, 5为最高级管理员)', required: false })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  adminLevel?: number;

  @ApiProperty({ description: '手机号码' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: '用户状态', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  roleIds?: string[];
}

export class CreateTenantUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
