import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtModule } from '@nestjs/jwt';

import { APP_GUARD } from '@nestjs/core';
import { AuthenticateGuard } from 'src/guards/auth.guard';
import { UserModule } from 'src/module/user/user.module';

import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { TenantModule } from 'src/module/tenant/tenant.module';

@Module({
  imports: [
    UserModule,
    TenantModule,
    // JwtModule.registerAsync({
    //   useFactory: (config: ConfigService) => {
    //     return config.get('jwt');
    //   },
    //   inject: [ConfigService],
    // }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],

  providers: [AuthService, { provide: APP_GUARD, useClass: AuthenticateGuard }, RefreshTokenStrategy],
})
export class AuthModule { }
