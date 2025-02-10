import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';


import { FileInterceptor } from '@nestjs/platform-express';

import { calculateOrderData, cleanAndExtractData } from 'src/common/utils/xlsx';
import { OrdersService } from '../orders/orders.service';
@Controller('upload')
export class FileUploadController {
  constructor(private readonly orderService: OrdersService) { }

  @Post('order')
  @UseInterceptors(FileInterceptor('file'))
  create(@UploadedFile() file: Express.Multer.File) {
    const data = calculateOrderData(cleanAndExtractData(file.buffer))
    return this.orderService.create(data)

  }

  @Get()
  findAll() {
    return null
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return null
  }


}
