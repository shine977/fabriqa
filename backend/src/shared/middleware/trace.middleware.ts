// src/shared/middleware/trace.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TraceContextService } from '../services/trace-context.service';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  constructor(private traceContextService: TraceContextService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    await this.traceContextService.run(async () => {
      const traceId = this.traceContextService.getTraceId();
      req['traceId'] = traceId;
      res.setHeader('X-Trace-ID', traceId);
      next();
    });
  }
}
