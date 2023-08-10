import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PartService } from './component.service';
import { CreatePartDto } from './dto/create-component.dto';
import { UpdatePartDto } from './dto/update-component.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Part')
@Controller('part')
export class PartController {
  constructor(private readonly partService: PartService) {}

  @Post()
  create(@Body() createPartDto: CreatePartDto) {
    return this.partService.create(createPartDto);
  }

  @Get()
  findAll() {
    return this.partService.findAll();
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
