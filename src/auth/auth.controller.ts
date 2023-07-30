import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Public } from 'src/common/decorator/public.decorator';
import { UserService } from 'src/user/user.service';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @Public()
  login(@Body() user: CreateUserDto) {
    return this.authService.authenticate(user.username);
  }
  @Post('register')
  @Public()
  register(@Body() user: CreateUserDto) {
    const usernameExists = this.userService.findOneByUsername(user.username);
    if (!usernameExists) throw new UnprocessableEntityException();
    return this.authService.authenticate(user.username);
  }
}
