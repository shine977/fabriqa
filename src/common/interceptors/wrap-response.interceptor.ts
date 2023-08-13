import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { UnifyResponse } from '../utils/unifyResponse';

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<UnifyResponse>): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = data || ({ code: 0, message: 'Succesfully' } as UnifyResponse);
        if (data) {
          if (!data.code) {
            response.code = 0;
          }
          if (!data.message) {
            response.message = 'Successfully';
          }
        }

        return response;
      }),
      // catchError((err) => {
      //   console.info('catchError', err);
      //   return EMPTY;
      // }),
    );
  }
}
