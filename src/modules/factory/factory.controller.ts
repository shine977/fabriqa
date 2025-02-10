import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FactoryService } from './factory.service';
import { CreateFactoryDto } from './dto/create-factory.dto';
import { UpdateFactoryDto } from './dto/update-factory.dto';

@Controller('factory')
export class FactoryController {
  constructor(private readonly factoryService: FactoryService) { }

  @Post()
  create(@Body() createFactoryDto: CreateFactoryDto) {
    console.log('factory', createFactoryDto);
    return this.factoryService.create(createFactoryDto);
  }

  @Get()
  findAll(@Query() query) {
    return this.factoryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.factoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFactoryDto: UpdateFactoryDto) {
    return this.factoryService.update(+id, updateFactoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.factoryService.remove(+id);
  }
}
