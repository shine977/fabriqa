import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Reflector } from '@nestjs/core';
import { OperationLogEntity } from 'src/common/entity/operation-log.entity';

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(OperationLogEntity)
    private logRepository: Repository<OperationLogEntity>,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const { user, method, url, body, ip } = request;

    return next.handle().pipe(
      tap(async (result) => {
        const duration = Date.now() - startTime;

        // 从控制器和方法上获取元数据
        const controllerName = context.getClass().name;
        const methodName = context.getHandler().name;

        // 获取Swagger的ApiOperation装饰器中的summary
        const apiOperation = this.reflector.get<string[]>('swagger/apiOperation', context.getHandler()) || '';
        const summary = apiOperation[0] || methodName;
        const log = new OperationLogEntity();
        log.module = controllerName.replace('Controller', '');
        log.type = methodName;
        log.description = summary;
        log.method = method;
        log.url = url;
        log.params = JSON.stringify(body);
        log.result = JSON.stringify(result);
        log.ip = ip;
        log.operator = user?.username || 'anonymous';
        log.duration = duration;

        await this.logRepository.save(log);
      }),
    );
  }
}
