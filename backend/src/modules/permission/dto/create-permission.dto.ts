import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsObject, ValidateNested, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PermissionScope, PermissionType } from '@shared/enum/permission.enum';

export class CreatePermissionDto {
  @ApiProperty({ description: '权限名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '权限编码，唯一标识，如：system:user:create' })
  @IsString()
  code: string;

  @ApiProperty({
    description: '权限类型',
    enum: PermissionType,
    example: PermissionType.MENU,
  })
  @IsEnum(PermissionType)
  type: PermissionType;

  @ApiProperty({
    description: '权限范围',
    enum: PermissionScope,
    example: PermissionScope.GLOBAL,
  })
  @IsEnum(PermissionScope)
  scope: PermissionScope;

  @ApiPropertyOptional({ description: '权限描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '是否启用' })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: '排序号' })
  @IsNumber()
  @IsOptional()
  orderNum?: number;

  @ApiPropertyOptional({ description: '图标' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: '路由路径' })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiPropertyOptional({ description: '前端组件' })
  @IsString()
  @IsOptional()
  component?: string;

  @ApiPropertyOptional({ description: '是否外链' })
  @IsBoolean()
  @IsOptional()
  isExternal?: boolean;

  @ApiPropertyOptional({ description: '是否可见' })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiPropertyOptional({ description: '是否缓存' })
  @IsBoolean()
  @IsOptional()
  isCache?: boolean;

  @ApiPropertyOptional({ description: '父级权限ID' })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ description: '元数据' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
