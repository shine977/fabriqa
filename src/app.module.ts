import { MiddlewareConsumer, Module, NestModule, RequestMethod, Scope } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './module/orders/orders.module';
import { DeliveriesModule } from './module/deliveries/deliveries.module';
import { MouldModule } from './module/bom/mold.module';
import { MaterialModule } from './module/bom/material.module';
import { PartModule } from './module/bom/component.module';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';
import { RequestMiddleware } from './middleware/request.middleware';
import { TenantModule } from './module/tenant/tenant.module';
import { FactoryModule } from './module/factory/factory.module';
import { StatementModule } from './module/statement/statement.module';


import { ResourceModule } from './module/resource/resource.module';
import { MenuModule } from './module/menu/menu.module';
import { RoleModule } from './module/role/role.module';
import { PermissionModule } from './module/permission/permission.module';
import { PolicyModule } from './module/policy/policy.module';

import { REQ_USER_CONTEXT } from './common/utils/constant';
import { ReceivingModule } from './module/receiving/receiving.module';
import { FileUploadModule } from './module/file-upload/file-upload.module';
import { CryptoController } from './crypto.controller';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '12345678',
      database: 'injecting_factory',
      synchronize: true,
      autoLoadEntities: true,
      logging: true,
      // logger: 'debug',
    }),
    OrdersModule,
    DeliveriesModule,
    MouldModule,
    MaterialModule,
    PartModule,
    AuthModule,
    UserModule,
    TenantModule,
    FactoryModule,
    StatementModule,
    RoleModule,
    PermissionModule,
    ResourceModule,
    MenuModule,
    TenantModule,
    PolicyModule,
    ReceivingModule,
    FileUploadModule
  ],
  controllers: [AppController, CryptoController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestMiddleware).forRoutes({ path: '*', method: RequestMethod.GET });
  }
}
