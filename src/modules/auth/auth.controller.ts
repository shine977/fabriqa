import { Controller, Post, Body, BadRequestException, Get, UseGuards, Request, Req } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { ApiTags } from '@nestjs/swagger';

import { Public } from 'src/shared/decorators/public.decorator';
import { CodeTips } from 'src/core/config/code.config';

import { AuthGuard } from '@nestjs/passport';
import { AuthMenuService } from './auth.menu.service';
import { User } from 'src/shared/decorators/user.decorator';
import { CreateTenantUserDto, CreateUserDto } from '@modules/user/dto/create-user.dto';
import { RefreshTokenGuard } from './guards';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authMenuService: AuthMenuService,
  ) {}

  @Post('login')
  @Public()
  @UseGuards(AuthGuard('local'))
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('menu')
  getUserMenus(@User('id') userId: string) {
    return this.authMenuService.getUserMenusAndPermissions(userId);
  }

  @Post('register/user')
  @Public()
  async register(@Body() userDto: CreateUserDto) {
    return this.authService.register(userDto);
  }

  @Post('register/tenant')
  async registerTenant(@Body() userDto: CreateTenantUserDto) {
    // const tenantExists = await this.tenantService.findOneByName(userDto.name);
    // if (tenantExists) throw new BadRequestException(CodeTips.c1000);
    // const tenant = await this.tenantService.create({ name: userDto.name, description: userDto.description });
    // return this.authService.registerTenant(userDto, tenant);
  }

  @UseGuards(RefreshTokenGuard)
  @Public()
  @Get('refresh')
  refreshToken(@Request() request) {
    const userId = request.user['sub'];
    const refreshToken = request.user['refreshToken'];
    return this.authService.refreshToken(userId, refreshToken);
  }
}
