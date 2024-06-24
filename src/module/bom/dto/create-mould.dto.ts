import { IsNotEmpty } from 'class-validator';
import { PlasticPartsEntity } from '../entities/plasticParts.entity';
import { FactoryEntity } from 'src/module/factory/entities/factory.entity';

export class CreateMouldDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  xoutx: string;

  parts: Array<PlasticPartsEntity>;
  customer: FactoryEntity;
}
