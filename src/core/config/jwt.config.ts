import { registerAs } from '@nestjs/config';

export const JWTConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  expiresIn: process.env.JWT_EXPIRES || '24h',
}));

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  expiresIn: string;
}
