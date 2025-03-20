import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RoleModule } from '../role/role.module';
import { PermissionModule } from '../permission/permission.module';
import { AuthMenuService } from './auth.menu.service';
import { MenuModule } from '../menu/menu.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { RoleEntity } from '../role/entities/role.entity';
import { PermissionEntity } from '../permission/entities/permission.entity';
import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { TokenService } from './services/token.service';
import { UserContext } from 'src/core/context/user-context';
import { MenuService } from '../menu/menu.service';
import { UserService } from '../user/user.service';
import { MenuEntity } from '../menu/entities/menu.entity';
import { UserContextService } from 'src/core/context/user-context.service';
import { UserContextModule } from 'src/core/context/user-context.module';
import { PermissionCoreModule } from 'src/core/permission/core/permission.module';
import { AuditableEntity, AuditLogEntity } from 'src/core/database/entities';
import { CacheModule } from '@core/cache';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    CacheModule.register(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('jwt');
        return {
          secret: config.accessSecret,
          signOptions: {
            expiresIn: config.expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
    // ConfigModule,
    // RoleModule,
    // PermissionCoreModule,
    MenuModule,
    UserModule,
    UserContextModule,
    // TypeOrmModule.forFeature([AuditLogEntity, AuditableEntity]),
  ],
  controllers: [AuthController],
  providers: [
    UserContext,
    AuthService,
    TokenService,
    // MenuService,
    AuthMenuService,
    // AuthMenuService,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
  ],
  // exports: [AuthService, JwtModule, PassportModule, LocalStrategy],
  exports: [UserContext],
})
export class AuthModule {}
