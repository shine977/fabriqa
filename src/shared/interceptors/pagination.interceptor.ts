import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const query = request.query;
    
    // 处理分页参数
    const pageSize = Math.max(1, +(query.pageSize || 10));
    const current = Math.max(1, +(query.current || 1));
    
    // 修改请求参数
    request.query = { ...query, pageSize, current };
    
    return next.handle();
  }
}