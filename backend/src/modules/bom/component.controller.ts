import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query } from '@nestjs/common';
import { PartService } from './component.service';
import { CreatePartDto } from './dto/create-component.dto';
import { UpdatePartDto } from './dto/update-component.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Component')
@Controller('component')
export class PartController {
  constructor(private readonly partService: PartService) { }

  @Post()
  create(@Body() createPartDto: CreatePartDto, @Request() req) {
    return this.partService.create(createPartDto, req.user);
  }

  @Get()
  findAll(@Query() query) {
    return this.partService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePartDto: UpdatePartDto) {
    return this.partService.update(+id, updatePartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partService.remove(+id);
  }
}
