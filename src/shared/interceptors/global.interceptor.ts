import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { from, Observable, throwError } from 'rxjs';
import { tap, map, catchError, switchMap } from 'rxjs/operators';
import { ModuleRef } from '@nestjs/core';
import { unifyResponse } from 'src/common/utils/unifyResponse';
import { UserContext } from 'src/core/context';

@Injectable()
export class GlobalInterceptor implements NestInterceptor {
  private readonly logger = new Logger('GlobalInterceptor');

  constructor(private readonly moduleRef: ModuleRef) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    // 1. request arrived, before route handler execution
    try {
      if (request.user) {
        // 2. route handler execution, return Observable
        this.logger.debug(`[Pre-Handler] Setting up user context: ${request.user.id}`);
        const userContext = await UserContext.createContext(request, this.moduleRef);
        return new Observable((subscriber) => {
          UserContext.runWithContext(userContext, async () => {
            try {
              const result = await next
                .handle()
                .pipe(
                  // 3. post handler routing handler execution completed, pipeline for response
                  tap(() => {
                    // 3.1 record the execution time (do not modify the response)
                    const duration = Date.now() - startTime;
                    this.logger.debug(`[Post-Handler] Execution time: ${duration}ms`);
                  }),
                  // 3.2 format the response
                  map((data) => this.formatResponse(data)),
                  // 3.3 catch and handle errors in the response
                  catchError((error) => {
                    const duration = Date.now() - startTime;
                    this.logger.error(`[Error] Handler failed after ${duration}ms:`, error);
                    return throwError(() => this.formatError(error));
                  }),
                )
                .toPromise();

              subscriber.next(result);
              subscriber.complete();
            } catch (error) {
              subscriber.error(error);
            }
          });
        });
      }
      return next.handle().pipe(
        map((data) => this.formatResponse(data)),
        catchError((error) => throwError(() => this.formatError(error))),
      );
    } catch (error) {
      // handle context setup error
      this.logger.error('[Pre-Handler Error] Context setup failed:', error);
      return throwError(() => this.formatError(error));
    }
  }

  private formatResponse(data: any): any {
    if (data == null) {
      return unifyResponse(0, 'success');
    }

    if (this.isStandardResponse(data)) {
      return data;
    }

    if (Array.isArray(data)) {
      return unifyResponse({ items: data, total: data.length });
    }

    return unifyResponse({ item: data });
  }

  private formatError(error: any): any {
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    return unifyResponse(status, message);
  }

  private isStandardResponse(data: any): boolean {
    return data && typeof data === 'object' && 'code' in data;
  }
}
