import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRolesDto } from '../role/dto/create-role.dto';
import { RequirePermissions } from 'src/core/permission/decorators/require.permissions.decorator';
import { Permissions } from 'src/shared/constants/permission.constants';
import { ForbiddenException } from '@nestjs/common';
import { PERMISSION_CHECKER_TYPE } from '@shared/enum/permission.enum';

import {
  CheckDataPermission,
  DataOperationType,
  DataPermission,
  DataPermissionType,
} from 'src/core/permission/decorators/data.permission.decorator';

import { BadRequestException } from '@nestjs/common';
import { DataPermissionGuard } from 'src/core/permission/guards/data.permission.guard';
import { isEmail, isPhoneNumber } from 'class-validator';

@ApiTags('用户管理')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @RequirePermissions([Permissions.SYSTEM.USER.CREATE], [PERMISSION_CHECKER_TYPE.ALL, '没有创建用户的权限'])
  @CheckDataPermission([
    {
      type: DataPermissionType.TYPE,
      operation: DataOperationType.CREATE,
      resource: 'user',
      field: 'adminLevel',
      errorMessage: '无法创建高于自己权限等级的用户',
    },
    {
      type: DataPermissionType.TENANT,
      operation: DataOperationType.CREATE,
      resource: 'user',
      errorMessage: '无法为其他租户创建用户',
    },
  ])
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    // 基础数据校验
    if (!createUserDto.username || !createUserDto.password) {
      throw new BadRequestException('用户名和密码不能为空');
    }

    // 管理员相关校验
    if (createUserDto.isAdmin) {
      const user = req.user;

      // 只有超级管理员和管理员可以创建管理员用户
      if (!user.isSuperAdmin && !user.isAdmin) {
        throw new ForbiddenException('只有超级管理员和管理员可以创建管理员用户');
      }

      // 设置默认管理员等级
      if (!createUserDto.adminLevel) {
        createUserDto.adminLevel = 1; // 默认最低级别管理员
      }

      // 管理员等级校验
      if (createUserDto.adminLevel < 1 || createUserDto.adminLevel > 5) {
        throw new BadRequestException('管理员等级必须在1-5之间');
      }

      // 普通管理员不能创建与自己同级别或更高级别的管理员
      if (!user.isSuperAdmin && user.isAdmin && createUserDto.adminLevel >= user.adminLevel) {
        throw new ForbiddenException('不能创建权限等级大于或等于自己的管理员用户');
      }
    }

    // 租户相关校验
    if (createUserDto.tenantId && createUserDto.tenantId !== req.user.tenantId) {
      throw new ForbiddenException('不能为其他租户创建用户');
    }

    // 确保新用户属于当前租户
    createUserDto.tenantId = req.user.tenantId;

    // 邮箱格式校验
    if (createUserDto.email && !isEmail(createUserDto.email)) {
      throw new BadRequestException('邮箱格式不正确');
    }

    // 手机号格式校验
    if (createUserDto.phone && !isPhoneNumber(createUserDto.phone)) {
      throw new BadRequestException('手机号格式不正确');
    }

    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(@Query() query) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  @RequirePermissions([Permissions.SYSTEM.USER.UPDATE])
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @RequirePermissions([Permissions.SYSTEM.USER.DELETE])
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Post(':id/roles')
  @ApiOperation({ summary: '分配用户角色' })
  @RequirePermissions([Permissions.SYSTEM.USER.ASSIGN_ROLE])
  async assignRoles(@Param('id') id: string, @Body() assignRolesDto: AssignRolesDto) {
    return this.userService.updateUserRoles(id, assignRolesDto.roleIds);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: '获取用户角色' })
  @RequirePermissions([Permissions.SYSTEM.USER.VIEW])
  async getUserRoles(@Param('id') id: string) {
    return this.userService.getUserWithRoles(id);
  }
}
