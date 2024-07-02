import { Controller, Post, Body, BadRequestException, Req, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

import { CreateTenantUserDto, CreateUserDto } from 'src/module/user/dto/create-user.dto';
import { Public } from 'src/decorator/public.decorator';
import { UserService } from 'src/module/user/user.service';
import { CodeTips } from 'src/config/code';
import { RefreshTokenGuard } from 'src/guards/refreshToken.guard';
import { TenantService } from 'src/module/tenant/tenant.service';
import { AuthGuard } from '@nestjs/passport';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
  ) { }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(@Request() req) {
    return this.authService.login(req.username);
  }
  @Post('register/user')
  @Public()
  async register(@Body() userDto: CreateUserDto) {
    const usernameExists = await this.userService.findOneByUsername(userDto.username);
    if (usernameExists) throw new BadRequestException(CodeTips.c1000);
    const user = await this.userService.create(userDto);
    return this.authService.authenticate(user);
  }
  @Post('register/tenant')
  async registerTenant(@Body() userDto: CreateTenantUserDto) {
    const tenantExists = await this.tenantService.findOneByName(userDto.name);
    if (tenantExists) throw new BadRequestException(CodeTips.c1000);
    const tenant = await this.tenantService.create({ name: userDto.name, description: userDto.description });
    const user = await this.userService.create({
      username: userDto.username || userDto.name,
      password: userDto.password,
      tenantId: tenant.tenantId,
    });
    return this.authService.authenticate(user);
  }
  @UseGuards(RefreshTokenGuard)
  @Public()
  @Get('refresh')
  refreshToken(@Req() request) {
    const userId = request.user['sub'];
    const refreshToken = request.user['refreshToken'];
    return this.authService.refreshToken(userId, refreshToken);
  }
}
