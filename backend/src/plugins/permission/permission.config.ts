import { PermissionScope } from '@shared/enum/permission.enum';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export class PermissionPluginConfig {
  @IsString()
  @IsOptional()
  defaultScope: PermissionScope = PermissionScope.GLOBAL;

  @IsString()
  @IsOptional()
  cachePrefix: string = 'permission_plugin';

  @IsString()
  @IsOptional()
  cacheTTL: number = 3600; // 1小时
}
