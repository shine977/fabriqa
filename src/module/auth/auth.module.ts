import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtModule } from '@nestjs/jwt';

import { APP_GUARD } from '@nestjs/core';

import { UserModule } from 'src/module/user/user.module';

import { RefreshStrategy } from './strategies/refresh.strategy';
import { TenantModule } from 'src/module/tenant/tenant.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthGuard } from '@nestjs/passport';

@Module({
  imports: [
    UserModule,
    TenantModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],

  providers: [AuthService, LocalStrategy, RefreshStrategy, JwtStrategy, {
    provide: APP_GUARD,
    useClass: AuthGuard('jwt')
  }],
})
export class AuthModule { }
