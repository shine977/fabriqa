// src/module/auth/services/auth.service.ts
import { ForbiddenException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { TokenService } from './token.service';
import { UserEntity } from '../../user/entities/user.entity';
import { decryptData, decryptFrontendData, encryptData } from '@shared/utils/crypto';
import { UnifyObjectResponse } from '@shared/utils/unifyResponse';
import { ErrorCode, createErrorResponse } from 'src/core/config/error-code';
import * as bcrypt from 'bcrypt';
import { CodeTips } from 'src/core/config/code.config';
import { UserService } from '@modules/user/user.service';
import { CreateTenantUserDto, CreateUserDto } from '@modules/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  async findOneByUsername(username: string): Promise<UserEntity> {
    return this.userService.findOneByUsername(username);
  }

  async validateUser(username: string, pass: string) {
    const user = await this.userService.findOneByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const decryptedPassword = decryptFrontendData(pass, 'e3a74e3c7599f3ab4601d587bd2cc768');

    const isValid = await bcrypt.compare(decryptedPassword, user.password);
    if (!isValid) {
      return 'user or password is incorrect';
    }

    return user;
  }

  async login(user: UserEntity) {
    const payload = await this.createAuthPayload(user);
    const tokens = await this.tokenService.generateTokens(payload);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);
    return { ...user, ...tokens };
  }

  /**
   * Logout a user by invalidating their tokens
   * @param userId User ID
   * @returns Success status
   */
  async logout(userId: string) {
    // 1. Clear the user's refresh token in the database
    await this.userService.updateRefreshToken(userId, null);

    // 2. Add the user's token to the blacklist
    await this.tokenService.addToBlacklist(userId);

    return { success: true, message: 'Logged out successfully' };
  }

  async register(userDto: CreateUserDto) {
    const usernameExists = await this.userService.findOneByUsername(userDto.username);
    if (usernameExists) throw new BadRequestException(CodeTips.c1000);
    const user = await this.userService.create(userDto);
    return this.authenticate(user);
  }

  async registerTenant(userDto: CreateTenantUserDto, tenant: any) {
    if (!userDto.username && !userDto.name) {
      throw new BadRequestException('Username is required');
    }
    const user = await this.userService.create({
      username: userDto.username || userDto.name,
      password: userDto.password,
      tenantId: tenant.id,
      // roleIds: userDto.roles,
    });
    return this.authenticate(user);
  }

  async authenticate(user: UserEntity): Promise<any> {
    const userData = user instanceof UserEntity ? user : (user as UnifyObjectResponse).item;
    if (!userData) {
      throw new ForbiddenException(createErrorResponse(ErrorCode.AUTH_INVALID_USER));
    }
    const payload = await this.createAuthPayload(userData as UserEntity);
    const tokens = await this.tokenService.generateTokens(payload);
    await this.userService.updateRefreshToken(userData.id, tokens.refreshToken);
    return { ...tokens, ...payload };
  }

  private async createAuthPayload(user: UserEntity) {
    const permissions = await this.userService.getUserPermissions(user.id);
    const isSuperAdmin = await this.userService.checkSuperAdminRole(user.id);
    return {
      sub: user.id,
      username: user.username,
      permissions,
      isSuperAdmin,
      tenantId: user.tenantId,
    };
  }
  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findById(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException(createErrorResponse(ErrorCode.AUTH_INVALID_REFRESH));
    }

    if (refreshToken !== user.refreshToken) {
      throw new ForbiddenException(createErrorResponse(ErrorCode.AUTH_INVALID_REFRESH));
    }

    const payload = await this.createAuthPayload(user);
    const tokens = await this.tokenService.generateTokens(payload);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }
}
