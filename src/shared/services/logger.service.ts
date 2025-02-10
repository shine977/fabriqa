// src/shared/services/logger.service.ts
import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { AlertService } from './alert.service';
import { TraceContextService } from './trace-context.service';

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor(
    private configService: ConfigService,
    private alertService: AlertService,
    private traceContextService: TraceContextService,
  ) {
    const env = this.configService.get('NODE_ENV');
    const logLevels: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];

    // 创建 Winston 传输器
    const transports = [
      // 控制台输出
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, context, trace, traceId }) => {
            return `${timestamp} ${traceId ? `[${traceId}]` : ''} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
          }),
        ),
      }),

      // 按日期轮转的文件传输器
      new DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }) as winston.transport,

      // 错误日志单独存储
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      }) as winston.transport,
    ];

    this.logger = winston.createLogger({
      level: env === 'production' ? 'info' : 'debug',
      defaultMeta: {
        service: 'injecting-admin',
      },
      transports,
    });
  }
  error(message: string, trace?: string, context?: string) {
    const traceId = this.traceContextService.getTraceId();
    this.logger.error(message, { trace, context, traceId });

    if (trace) {
      this.alertService.handleError(new Error(message), context || 'global');
    }
  }
  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
  // ... 其他方法保持不变
}
