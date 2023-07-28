import { PartialType } from '@nestjs/mapped-types';
import { CreateMouldDto } from './create-mould.dto';

export class UpdateMouldDto extends PartialType(CreateMouldDto) {}
