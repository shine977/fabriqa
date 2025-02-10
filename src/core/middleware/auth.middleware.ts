import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ModuleRef } from '@nestjs/core';
import { UserContext } from '../context';
import { ConfigService } from '@nestjs/config';

const WHITE_LIST = ['/api/auth/login', '/api/auth/refresh'];

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger('AuthMiddleware');

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly moduleRef: ModuleRef,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const token = this.extractToken(req);

      // 如果是白名单或没有token，直接放行
      if (!token || WHITE_LIST.includes(req.url)) {
        this.logger.debug('No token found in request or url in white list: ', req.url);
        return next();
      }

      // 验证token
      const config = this.configService.get('jwt');
      const payload = await this.jwtService.verifyAsync(token, { secret: config.accessSecret });

      if (!payload) {
        this.logger.debug('Invalid token payload');
        return next();
      }

      // 设置用户信息
      this.logger.debug(`Authenticated user: ${payload.sub}`);
      req['user'] = payload;

      // 创建上下文
      const context = await UserContext.createContext(req, this.moduleRef);

      // 使用 runInContext 包装后续的请求处理
      UserContext.runInContext(context, () => {
        const currentContext = UserContext.getContext();
        this.logger.debug(`Context verified: ${currentContext?.getId()}`);
        next();
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        this.logger.debug('Invalid token');
      } else {
        this.logger.error('Authentication error:', error);
      }
      next();
    }
  }

  private extractToken(req: Request): string | undefined {
    const [type, token] = (req.headers.authorization ?? '').split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
