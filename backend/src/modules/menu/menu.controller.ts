import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/core/permission/decorators/require.permissions.decorator';
import { MenuEntity } from './entities/menu.entity';
import { NoRepeatSubmit } from 'src/shared/decorators/no-repeat-submit';
import { OperationLogInterceptor } from 'src/shared/interceptors/operation-log.interceptor';
import { Permissions } from 'src/shared/constants/permission.constants';

@ApiTags('菜单管理')
@ApiBearerAuth()
@UseInterceptors(OperationLogInterceptor)
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiOperation({ summary: '创建菜单' })
  @ApiResponse({ status: 201, type: MenuEntity })
  @RequirePermissions([Permissions.SYSTEM.MENU.CREATE])
  @NoRepeatSubmit()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @Get()
  @ApiOperation({ summary: '获取菜单树' })
  @ApiResponse({ status: 200, type: [MenuEntity] })
  @RequirePermissions([Permissions.SYSTEM.MENU.VIEW])
  findAll() {
    return this.menuService.findAll();
  }

  @Get('user-menus')
  @ApiOperation({ summary: '获取当前用户的菜单' })
  @ApiResponse({ status: 200, type: [MenuEntity] })
  getUserMenus() {
    return this.menuService.getUserMenus();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取菜单详情' })
  @ApiResponse({ status: 200, type: MenuEntity })
  @RequirePermissions([Permissions.SYSTEM.MENU.VIEW])
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.menuService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新菜单' })
  @ApiResponse({ status: 200, type: MenuEntity })
  @RequirePermissions([Permissions.SYSTEM.MENU.UPDATE])
  @NoRepeatSubmit()
  update(@Param('id', ParseIntPipe) id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  @ApiResponse({ status: 200 })
  @RequirePermissions([Permissions.SYSTEM.MENU.DELETE])
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.menuService.remove(id);
  }

  @Post('order')
  @ApiOperation({ summary: '更新菜单排序' })
  @ApiResponse({ status: 200 })
  @RequirePermissions([Permissions.SYSTEM.MENU.UPDATE])
  @NoRepeatSubmit()
  updateOrder(@Body() orders: { id: number; orderNum: number }[]) {
    return this.menuService.updateMenuOrder(orders);
  }
}
