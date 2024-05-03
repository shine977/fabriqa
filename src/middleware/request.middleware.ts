import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    req.query.pageSize = +req.query.pageSize || 10;
    req.query.current = +req.query.current || 1;
    next();
  }
}
