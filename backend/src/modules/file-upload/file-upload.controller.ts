import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { calculateOrderData, cleanAndExtractData } from '@shared/utils/xlsx';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from '@modules/orders/dto/create-order.dto';
import { MATERIAL_TYPE } from '@shared/constants/order.constants';
@Controller('upload')
export class FileUploadController {
  private readonly logger = new Logger(FileUploadController.name);
  constructor(private readonly orderService: OrdersService) {}

  @Post('order')
  @UseInterceptors(FileInterceptor('file'))
  async create(@UploadedFile() file: Express.Multer.File) {
    try {
      // Extract data from Excel
      const data = calculateOrderData(cleanAndExtractData(file.buffer));

      // // Transform to CreateOrderDto
      // const createOrderDto: CreateOrderDto = {
      //   orderNo: data.orderNo,
      //   customer: data.customer,
      //   purchaseDate: new Date(data.purchaseDate),
      //   paymentClause: data.paymentClause,
      //   paymentTerm: data.paymentTerm,
      //   taskOrderNo: data.taskOrderNo,
      //   amount: data.amount,
      //   taxRate: data.taxRate || 13,
      //   factoryId: data.factoryId,
      //   items: data.items.map(item => ({
      //     materialNo: item.materialNo,
      //     materialCode: item.materialCode || item.materialNo,
      //     name: item.name,
      //     material: MATERIAL_TYPE.OTHER, // 设置默认值
      //     specification: item.specification,
      //     unit: item.unit || 'PCS',
      //     quantity: item.quantity,
      //     unitPrice: item.unitPrice,
      //     delivery: new Date(item.delivery),
      //     dynamicFields: {}
      //   }))
      // };

      // Create order
      // return this.orderService.create(data);
    } catch (error) {
      this.logger.error(`Error processing order file: ${error.message}`, error.stack);
      throw new HttpException('Failed to process order file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  findAll() {
    return null;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return null;
  }
}
