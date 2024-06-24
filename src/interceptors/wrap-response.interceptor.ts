import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { UnifyResponse } from '../common/utils/unifyResponse';

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<UnifyResponse>): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        let response = data || ({ code: 0, message: 'Succesfully' } as UnifyResponse);
        if (data) {
          if (typeof data == 'object') {
            response.code ||= 0;
            response.message ||= 'Successfully';
          } else {
            response = { code: 0, message: data } as unknown as UnifyResponse;
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
