import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseInterceptors,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from 'src/core/permission/decorators/require.permissions.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { NoRepeatSubmit } from 'src/shared/decorators/no-repeat-submit';
import { OperationLogInterceptor } from 'src/shared/interceptors/operation-log.interceptor';
import { Permissions } from 'src/shared/constants/permission.constants';

@ApiTags('库存管理')
@ApiBearerAuth()
@Controller('inventory')
@UseInterceptors(OperationLogInterceptor)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: '创建库存' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '创建成功' })
  @RequirePermissions([Permissions.RESOURCE.MATERIAL.CREATE])
  @NoRepeatSubmit()
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @ApiOperation({ summary: '获取库存列表' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  @RequirePermissions([Permissions.RESOURCE.MATERIAL.VIEW])
  @UseInterceptors(CacheInterceptor)
  findAll(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个库存详情' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  @RequirePermissions([Permissions.RESOURCE.MATERIAL.VIEW])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新库存' })
  @ApiResponse({ status: HttpStatus.OK, description: '更新成功' })
  @RequirePermissions([Permissions.RESOURCE.MATERIAL.UPDATE])
  @NoRepeatSubmit()
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateInventoryDto: UpdateInventoryDto
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除库存' })
  @ApiResponse({ status: HttpStatus.OK, description: '删除成功' })
  @RequirePermissions([Permissions.RESOURCE.MATERIAL.DELETE])
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.remove(id);
  }

  @Post('transaction')
  @ApiOperation({ summary: '创建库存交易' })
  @ApiResponse({ status: HttpStatus.CREATED, description: '创建成功' })
  @RequirePermissions([Permissions.RESOURCE.MATERIAL.UPDATE])
  @NoRepeatSubmit()
  createTransaction(@Body() createTransactionDto: CreateInventoryTransactionDto) {
    return this.inventoryService.createTransaction(createTransactionDto);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: '获取库存交易记录' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  @RequirePermissions([Permissions.RESOURCE.MATERIAL.VIEW])
  findTransactions(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10
  ) {
    return this.inventoryService.findTransactions(id, page, pageSize);
  }

  @Get('stats/low-stock')
  @ApiOperation({ summary: '获取库存预警列表' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  @RequirePermissions([Permissions.RESOURCE.MATERIAL.VIEW])
  @UseInterceptors(CacheInterceptor)
  getLowStockItems() {
    return this.inventoryService.getLowStockItems();
  }

  @Get('stats/overview')
  @ApiOperation({ summary: '获取库存统计信息' })
  @ApiResponse({ status: HttpStatus.OK, description: '获取成功' })
  @RequirePermissions([Permissions.RESOURCE.MATERIAL.VIEW])
  @UseInterceptors(CacheInterceptor)
  getInventoryStats() {
    return this.inventoryService.getInventoryStats();
  }

  @Post(':id/reserve')
  @ApiOperation({ summary: '预留库存' })
  @ApiResponse({ status: HttpStatus.OK, description: '预留成功' })
  @RequirePermissions([Permissions.RESOURCE.MATERIAL.UPDATE])
  @NoRepeatSubmit()
  @HttpCode(HttpStatus.OK)
  reserveInventory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: { quantity: number; referenceNo?: string; referenceType?: string }
  ) {
    return this.inventoryService.reserveInventory(
      id, 
      data.quantity, 
      data.referenceNo, 
      data.referenceType
    );
  }

  @Post(':id/cancel-reservation')
  @ApiOperation({ summary: '取消预留库存' })
  @ApiResponse({ status: HttpStatus.OK, description: '取消预留成功' })
  @RequirePermissions([Permissions.RESOURCE.MATERIAL.UPDATE])
  @NoRepeatSubmit()
  @HttpCode(HttpStatus.OK)
  cancelReservation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: { quantity: number; referenceNo?: string; referenceType?: string }
  ) {
    return this.inventoryService.cancelReservation(
      id, 
      data.quantity, 
      data.referenceNo, 
      data.referenceType
    );
  }
}
