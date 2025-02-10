import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ReceivingService } from './receiving.service';
import { CreateReceivingDto } from './dto/create-receiving.dto';
import { UpdateReceivingDto } from './dto/update-receiving.dto';

@Controller('receiving')
export class ReceivingController {
  constructor(private readonly receivingService: ReceivingService) { }

  @Post()
  create(@Body() createReceivingDto: CreateReceivingDto) {
    return this.receivingService.create(createReceivingDto);
  }

  @Get()
  findAll(@Query() query) {
    return this.receivingService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receivingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReceivingDto: UpdateReceivingDto) {
    return this.receivingService.update(+id, updateReceivingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.receivingService.remove(+id);
  }
}
