import { IsNotEmpty } from 'class-validator';
import { ComponentEntity } from '../entities/component.entity';
import { FactoryEntity } from '@modules/factories/entities/factory.entity';

export class CreateMouldDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  xoutx: string;

  parts: Array<ComponentEntity>;
  customer: FactoryEntity;
}
