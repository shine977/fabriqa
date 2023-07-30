import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

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
        console.log(data);
        let response = {
          code: 0,
          message: 'Succesfully',
        } as WrapResponse;
        if (Array.isArray(data)) {
          response.items = data;
        } else if (
          typeof data == 'string' ||
          typeof data == 'boolean' ||
          typeof data == 'number'
        ) {
          response.item = data;
        } else {
          if (data.message) {
            response = { ...response, ...data };
          } else {
            response.item = data;
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
