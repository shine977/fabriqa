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
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderQueryOptions } from './interfaces/order.interface';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { OrderEntity } from './entities/order.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('orders')
@Controller('orders')
@UseInterceptors(CacheInterceptor)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order with dynamic fields' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import orders from Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async importFromExcel(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<OrderEntity[]> {
    return this.ordersService.importFromExcel(file);
  }
  @Get('/items')
  findAllItems() {
    return this.ordersService.findAllItems();
  }

  @Get()
  @ApiOperation({ summary: 'Find all orders with optional dynamic fields' })
  findAll(@Query() options: OrderQueryOptions) {
    return this.ordersService.findAll(options);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find order by id with dynamic fields' })
  findOne(@Param('id') id: string, @Query() options: OrderQueryOptions) {
    return this.ordersService.findOne(id, options);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order with dynamic fields' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  @Get(':id/template')
  @ApiOperation({ summary: 'Get order template with inheritance' })
  async getTemplate(@Param('id') id: string) {
    return this.ordersService.getOrderWithTemplate(id);
  }
}
