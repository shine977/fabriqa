// src/decorators/advanced-logger.decorator.ts

import { Logger } from '@nestjs/common';

export interface AdvancedLoggerOptions {
  context?: string;
  level?: 'log' | 'error' | 'warn' | 'debug' | 'verbose';
  logParams?: {
    args?: boolean;
    result?: boolean;
    error?: boolean;
    timing?: boolean;
  };
  conditions?: {
    onlyIf?: (...args: any[]) => boolean;
    skipIf?: (...args: any[]) => boolean;
  };
  redact?: string[];
  format?: {
    args?: (args: any[]) => any;
    result?: (result: any) => any;
  };
}

export function AdvancedLog(options: AdvancedLoggerOptions = {}) {
  const logger = new Logger(options.context);
  const level = options.level || 'log';

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = options.logParams?.timing ? Date.now() : 0;
      const methodName = `${target.constructor.name}.${propertyKey}`;

      // 检查条件
      if (options.conditions?.skipIf?.apply(this, args)) {
        return originalMethod.apply(this, args);
      }
      if (options.conditions?.onlyIf && !options.conditions.onlyIf.apply(this, args)) {
        return originalMethod.apply(this, args);
      }

      // 处理参数
      let logArgs = args;
      if (options.redact) {
        logArgs = args.map(arg => {
          if (typeof arg === 'object') {
            const copy = { ...arg };
            options.redact!.forEach(key => {
              if (copy[key]) copy[key] = '***';
            });
            return copy;
          }
          return arg;
        });
      }
      if (options.format?.args) {
        logArgs = options.format.args(logArgs);
      }

      try {
        // 记录方法调用
        if (options.logParams?.args) {
          logger[level](`${methodName} called with args:`, logArgs);
        }

        // 执行原始方法
        const result = await originalMethod.apply(this, args);

        // 处理结果
        let logResult = result;
        if (options.format?.result) {
          logResult = options.format.result(result);
        }

        // 记录结果
        if (options.logParams?.result) {
          logger[level](`${methodName} returned:`, logResult);
        }

        // 记录执行时间
        if (options.logParams?.timing) {
          const duration = Date.now() - startTime;
          logger[level](`${methodName} took ${duration}ms`);
        }

        return result;
      } catch (error) {
        if (options.logParams?.error) {
          logger.error(`${methodName} threw error:`, error);
        }
        throw error;
      }
    };

    return descriptor;
  };
}