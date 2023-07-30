import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { EMPTY, Observable, catchError, map } from 'rxjs';

interface WrapResponse {
  code: number;
  message: string;
  items: any[];
  item?: object;
}

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<WrapResponse>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        let response = {
          code: 0,
          message: 'successful',
        } as WrapResponse;
        if (Array.isArray(data)) {
          response.items = data;
        } else {
          response = { ...response, ...data };
        }

        return response;
      }),
      catchError((err) => {
        console.info('catchError', err);
        return EMPTY;
      }),
    );
  }
}
