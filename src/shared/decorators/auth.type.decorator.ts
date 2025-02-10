import { SetMetadata } from '@nestjs/common';

export const AUTH_TYPE_KEY = 'auth:type';

export type AuthType = 'local' | 'jwt' | 'refresh';

export const AuthType = (type: AuthType) => SetMetadata(AUTH_TYPE_KEY, type);