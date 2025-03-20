import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryEntity } from './entities/inventory.entity';
import { InventoryTransactionEntity } from './entities/inventory-transaction.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { UserModule } from '../user/user.module';
import { MaterialModule } from '@modules/bom/material.module';
import { FactoryModule } from '@modules/factories/factory.module';
import { CacheModule } from '@core/cache';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryEntity, InventoryTransactionEntity]),
    EventEmitterModule.forRoot(),
    CacheModule.register({
      ttl: 60 * 5, // 5 minutes cache
      max: 100, // maximum number of items in cache
    }),
    MaterialModule,
    FactoryModule,
    UserModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
