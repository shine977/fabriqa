import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '@modules/auth/guards';

@ApiTags('角色管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: '创建角色' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: '获取角色列表' })
  findAll(@Query() query: { name?: string; code?: string; isEnabled?: boolean }) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取角色详情' })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新角色' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
