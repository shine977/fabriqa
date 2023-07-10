import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class PagerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    req.query.take = +req.query.take || 10;
    req.query.skip = +req.query.skip || 10;
    next();
  }
}
