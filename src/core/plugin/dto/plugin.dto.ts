import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsOptional } from 'class-validator';
import { PluginStatus, PluginType } from '../types/plugin.type';

export class PluginDto {
  @ApiProperty({ description: '插件ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: '插件名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '插件描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '插件版本' })
  @IsString()
  version: string;

  @ApiProperty({ description: '插件类型', enum: PluginType })
  type: PluginType;

  @ApiProperty({ description: '插件状态', enum: PluginStatus })
  status: PluginStatus;

  @ApiProperty({ description: '作者' })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({ description: '主页' })
  @IsString()
  @IsOptional()
  homepage?: string;

  @ApiProperty({ description: '安装时间' })
  installedAt?: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt?: Date;
}

export class InstallPluginDto {
  @ApiProperty({ description: '插件配置' })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
