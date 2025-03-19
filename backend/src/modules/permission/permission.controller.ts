import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionEntity } from './entities/permission.entity';

@ApiTags('权限管理')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建权限' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '权限创建成功',
    type: PermissionEntity,
  })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取所有权限' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: [PermissionEntity],
  })
  findAll() {
    return this.permissionService.findAll();
  }

  @Get('tree')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取权限树' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: [PermissionEntity],
  })
  findTree() {
    return this.permissionService.findTree();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取指定权限' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    type: PermissionEntity,
  })
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新权限' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '更新成功',
    type: PermissionEntity,
  })
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除权限' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '删除成功',
  })
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
}
