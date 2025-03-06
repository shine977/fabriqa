import { IsString, IsOptional, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
    @ApiProperty({ description: '角色名称' })
    @IsString()
    name: string;

    @ApiProperty({ description: '角色编码' })
    @IsString()
    code: string;

    @ApiProperty({ description: '角色描述' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: '是否启用' })
    @IsBoolean()
    @IsOptional()
    isEnabled?: boolean;

    @ApiProperty({ description: '排序号' })
    @IsNumber()
    @IsOptional()
    orderNum?: number;

    @ApiProperty({ description: '菜单ID列表' })
    @IsArray()
    @IsOptional()
    menuIds?: number[];
}

export class AssignRolesDto {
    @ApiProperty({ description: '角色ID列表' })
    @IsArray()
    @IsNumber({}, { each: true })
    roleIds: string[];
}
