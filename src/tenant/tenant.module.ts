import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './entities/tenant.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { OrderEntity } from 'src/orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity, UserEntity, ProductEntity, OrderEntity])],
  controllers: [TenantController],
  providers: [TenantService],
})
export class TenantModule {}
