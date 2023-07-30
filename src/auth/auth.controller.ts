import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Public } from 'src/common/decorator/public.decorator';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  login(@Body() user: CreateUserDto) {
    return this.authService.getTokenForUser(user.username);
  }

  @Get('profile')
  async getProfile(@Request() request) {
    console.log('getProfile', request);
    return request.user;
  }
}
