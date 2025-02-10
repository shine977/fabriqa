import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Length, Max, Min, ValidateIf, ValidateNested } from 'class-validator';
import { MenuTypeEnum } from '../entities/menu.entity';

class MenuMetaDto {
    @ApiPropertyOptional({ description: '菜单标题（国际化）' })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({ description: '菜单图标' })
    @IsString()
    @IsOptional()
    icon?: string;

    @ApiPropertyOptional({ description: '是否缓存', default: true })
    @IsBoolean()
    @IsOptional()
    noCache?: boolean;

    @ApiPropertyOptional({ description: '是否显示面包屑', default: true })
    @IsBoolean()
    @IsOptional()
    breadcrumb?: boolean;

    @ApiPropertyOptional({ description: '是否固定标签', default: false })
    @IsBoolean()
    @IsOptional()
    affix?: boolean;

    @ApiPropertyOptional({ description: '高亮菜单' })
    @IsString()
    @IsOptional()
    activeMenu?: string;
}

export class CreateMenuDto {
    @ApiProperty({ description: '菜单名称', example: '系统管理' })
    @IsString()
    @IsNotEmpty({ message: '菜单名称不能为空' })
    @Length(2, 50, { message: '菜单名称长度必须在2-50个字符之间' })
    name: string;

    @ApiPropertyOptional({ description: '菜单路径', example: '/system' })
    @IsString()
    @IsOptional()
    @Length(1, 100, { message: '菜单路径长度必须在1-100个字符之间' })
    path?: string;

    @ApiProperty({ description: '菜单类型', enum: MenuTypeEnum, example: MenuTypeEnum.MENU })
    @IsEnum(MenuTypeEnum, { message: '无效的菜单类型' })
    type: MenuTypeEnum;

    @ApiPropertyOptional({ description: '组件路径', example: 'system/menu/index' })
    @ValidateIf(o => o.type === MenuTypeEnum.MENU)
    @IsString()
    @Length(1, 100, { message: '组件路径长度必须在1-100个字符之间' })
    component?: string;

    @ApiPropertyOptional({ description: '菜单图标', example: 'setting' })
    @IsString()
    @IsOptional()
    @Length(1, 50, { message: '图标长度必须在1-50个字符之间' })
    icon?: string;

    @ApiPropertyOptional({ description: '排序号', example: 1, default: 0 })
    @Type(() => Number)
    @IsNumber()
    @Min(0, { message: '排序号不能小于0' })
    @Max(9999, { message: '排序号不能大于9999' })
    orderNum: number = 0;

    @ApiPropertyOptional({ description: '权限标识', example: 'system:menu:list' })
    @ValidateIf(o => o.type === MenuTypeEnum.BUTTON)
    @IsString()
    @Length(1, 100, { message: '权限标识长度必须在1-100个字符之间' })
    permission?: string;

    @ApiPropertyOptional({ description: '是否可见', default: true })
    @IsBoolean()
    @IsOptional()
    isVisible?: boolean = true;

    @ApiPropertyOptional({ description: '是否启用', default: true })
    @IsBoolean()
    @IsOptional()
    isEnabled?: boolean = true;

    @ApiPropertyOptional({ description: '父级菜单ID' })
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    parentId?: string;

    @ApiPropertyOptional({ description: '菜单元数据' })
    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => MenuMetaDto)
    meta?: MenuMetaDto;
}