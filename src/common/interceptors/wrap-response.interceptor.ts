import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { EMPTY, Observable, catchError, map } from 'rxjs';

interface WrapResponse {
  code?: string;
  message: string;
}

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<WrapResponse>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return {
          code: 0,
          message: 'successful',
          ...data,
        };
      }),
      catchError((err) => {
        console.log('catchError', err);
        return EMPTY;
      }),
    );
  }
}
