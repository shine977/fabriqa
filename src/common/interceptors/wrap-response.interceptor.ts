import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { UnifyResponse } from '../utils/unifyResponse';

@Injectable()
export class WrapResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<UnifyResponse>): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        console.log(data);
        const response = data;
        if (!data.code) {
          response.code = 0;
        }
        if (!data.message) {
          response.message = 'Succesfully';
        }

        // if (Array.isArray(data)) {
        //   response.items = data;
        // } else if (
        //   typeof data == 'string' ||
        //   typeof data == 'boolean' ||
        //   typeof data == 'number'
        // ) {
        //   response.item = data;
        // } else {
        //   if (data.message) {
        //     response = { ...response, ...data };
        //   } else {
        //     response.item = data;
        //   }
        // }

        return response;
      }),
      // catchError((err) => {
      //   console.info('catchError', err);
      //   return EMPTY;
      // }),
    );
  }
}
