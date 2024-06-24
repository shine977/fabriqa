import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { TenantService } from 'src/module/tenant/tenant.service';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log(context.getHandler());
    const request = context.switchToHttp().getRequest<Request>();
    let url = request.headers.origin || process.env.CLIENT_URL;
    url = url.replace(/(^\w+:|^)\/\//, '');
    console.log(url);
    return next.handle();
  }
}
