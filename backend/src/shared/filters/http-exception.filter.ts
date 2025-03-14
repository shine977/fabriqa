import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter<T extends HttpException> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const error = typeof response == 'string' ? { message: exceptionResponse } : (exceptionResponse as object);
    console.log('HttpException', error);
    response.status(status).json({ ...error, timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss')});
  }
}
