import { PartialType } from '@nestjs/mapped-types';
import { CreatePartDto } from './create-component.dto';

export class UpdatePartDto extends PartialType(CreatePartDto) {}
