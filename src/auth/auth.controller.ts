import { Controller, Post, Body, UnprocessableEntityException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { UserService } from 'src/user/user.service';
import { CodeTips, ErrorCode } from 'src/config/code';
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
    console.log(usernameExists);
    if (usernameExists) throw new BadRequestException(CodeTips.c1000);
    user = await this.userService.create(user);
    return this.authService.authenticate(user.username);
  }
}
