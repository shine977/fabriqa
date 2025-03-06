import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { UserContextModule } from '@core/context/user-context.module';
import { UserContext } from '@core/context';
import { OrderPlugin } from 'src/plugins/order/order.plugin';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { FactoryEntity } from '@modules/factories/entities/factory.entity';
import { DynamicFieldModule } from '@core/dynamic-field/dynamic-field.module';
import { SupplierEntity } from '@modules/suppliers/entities/supplier.entity';
import { CustomerEntity } from '@modules/customer/entities/customer.entity';
import { ExcelImportService } from 'src/plugins/order/services/excel-import.service';
import { DefaultExcelParser } from 'src/plugins/order/parsers/default-excel-parser';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, FactoryEntity, SupplierEntity, CustomerEntity]),
    UserContextModule,
    DynamicFieldModule,
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, UserContext, OrderPlugin, EventEmitter2, ExcelImportService, DefaultExcelParser],
  exports: [OrdersService],
})
export class OrdersModule {}
