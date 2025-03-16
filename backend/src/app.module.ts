import { MiddlewareConsumer, Module, NestModule, RequestMethod, Scope } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { InitModule } from './init/init.module';

import { PermissionCoreModule } from './core/permission/core/permission.module';
import { AuthMiddleware } from './core/middleware/auth.middleware';
import { JwtService } from '@nestjs/jwt';
import { UserContextModule } from './core/context/user-context.module';
import { JWTConfig, databaseConfig, getTypeOrmConfig } from './core/config';
import { CacheModule } from './core/cache/cache.module';
import { CustomLogger } from './shared/services/logger.service';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';
import { TraceMiddleware } from './shared/middleware/trace.middleware';
import { TraceContextService } from './shared/services/trace-context.service';
import { AlertService } from './shared/services/alert.service';
import { GlobalInterceptor } from './shared/interceptors';
import { JwtAuthGuard } from '@modules/auth/guards';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { PluginModule } from '@core/plugin';
import * as path from 'path';
import { PermissionModule } from '@modules/permission/permission.module';
import { OrdersModule } from '@modules/orders/orders.module';
import { PaginationModule } from '@common/module/pagination/pagination.module';

@Module({
  imports: [
    InitModule,
    PaginationModule.forRoot(),

    ConfigModule.forRoot({ isGlobal: true, load: [JWTConfig, databaseConfig] }),

    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return getTypeOrmConfig({ ...dbConfig, autoLoadEntities: true });
      },
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
    }),

    UserContextModule,
    AuthModule,
    PermissionCoreModule,
    PermissionModule,
    UserModule,
    PluginModule.forRoot({
      pluginDir: path.resolve(__dirname, 'plugins'),
      systemPlugins: ['permission'],
      maxConcurrentLoads: 5,
    }),
    OrdersModule,
    // DeliveriesModule,
    // MouldModule,
    // MaterialModule,
    // PartModule,

    // FactoryModule,
    // StatementModule,
    // RoleModule,
    // PermissionModule,
    // ResourceModule,
    // MenuModule,
    // PolicyModule,
    // ReceivingModule,
    // FileUploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtService,
    TraceContextService,
    AlertService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // { provide: APP_GUARD, useClass: PermissionGuard },
    { provide: APP_INTERCEPTOR, useClass: GlobalInterceptor },
    {
      provide: CustomLogger,
      useClass: CustomLogger,
    },
  ],
  exports: [CustomLogger, TraceContextService, AlertService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware, AuthMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
