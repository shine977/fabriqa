import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './entities/tenant.entity';
import { UserEntity } from 'src/module/user/entities/user.entity';

import { OrderEntity } from 'src/module/orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity, UserEntity, OrderEntity])],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule { }
