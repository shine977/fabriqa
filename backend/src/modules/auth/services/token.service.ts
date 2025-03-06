// src/module/auth/services/token.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  // 使用内存存储黑名单
  private tokenBlacklist = new Map<string, Date>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: any) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION') || '24h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string, isRefreshToken = false) {
    const secret = isRefreshToken 
      ? this.configService.get('JWT_REFRESH_SECRET')
      : this.configService.get('JWT_ACCESS_SECRET');
    
    return this.jwtService.verifyAsync(token, { secret });
  }

  /**
   * Add a token to the blacklist
   * @param userId User ID
   * @param token Optional token to blacklist
   */
  async addToBlacklist(userId: string, token?: string) {
    // Calculate expiry time based on access token expiration
    const expiresIn = this.configService.get('JWT_ACCESS_EXPIRATION') || '24h';
    const expiryDate = new Date();
    
    // Parse expiration time
    if (expiresIn.endsWith('h')) {
      expiryDate.setHours(expiryDate.getHours() + parseInt(expiresIn));
    } else if (expiresIn.endsWith('d')) {
      expiryDate.setDate(expiryDate.getDate() + parseInt(expiresIn));
    } else if (expiresIn.endsWith('m')) {
      expiryDate.setMinutes(expiryDate.getMinutes() + parseInt(expiresIn));
    }
    
    // Add to blacklist with expiry date
    this.tokenBlacklist.set(userId, expiryDate);
    
    // Clean up expired entries
    this.cleanupBlacklist();
    
    return true;
  }
  
  /**
   * Check if a user's token is blacklisted
   * @param userId User ID
   * @returns boolean
   */
  isTokenBlacklisted(userId: string): boolean {
    const expiry = this.tokenBlacklist.get(userId);
    if (!expiry) return false;
    
    // Check if blacklist entry is still valid
    return expiry > new Date();
  }
  
  /**
   * Clean up expired blacklist entries
   */
  private cleanupBlacklist() {
    const now = new Date();
    for (const [userId, expiry] of this.tokenBlacklist.entries()) {
      if (expiry <= now) {
        this.tokenBlacklist.delete(userId);
      }
    }
  }
}