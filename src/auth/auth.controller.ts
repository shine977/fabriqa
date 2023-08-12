import { Controller, Post, Body, BadRequestException, Req, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { UserService } from 'src/user/user.service';
import { CodeTips } from 'src/config/code';
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

  @Post('login')
  @Public()
  login(@Body() user: CreateUserDto) {
    return this.authService.authenticate(user.username);
  }
  @Post('register')
  @Public()
  async register(@Body() user: CreateUserDto) {
    const usernameExists = await this.userService.findOneByUsername(user.username);
    if (usernameExists) throw new BadRequestException(CodeTips.c1000);
    user = await this.userService.create(user);
    return this.authService.authenticate(user.username);
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
