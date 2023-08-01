import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MouldService } from './mould.service';
import { CreateMouldDto } from './dto/create-mould.dto';
import { UpdateMouldDto } from './dto/update-mould.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Mould')
@Controller('mould')
export class MouldController {
  constructor(private readonly mouldService: MouldService) {}

  @Post()
  create(@Body() createMouldDto: CreateMouldDto) {
    return this.mouldService.create(createMouldDto);
  }

  @Get()
  findAll() {
    return this.mouldService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mouldService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMouldDto: UpdateMouldDto) {
    return this.mouldService.update(+id, updateMouldDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mouldService.remove(+id);
  }
}
