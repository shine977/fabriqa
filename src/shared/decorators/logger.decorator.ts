// src/decorators/logger.decorator.ts

import { Logger } from '@nestjs/common';

export interface LoggerOptions {
  context?: string;
  logArgs?: boolean;
  logResult?: boolean;
  level?: 'log' | 'error' | 'warn' | 'debug' | 'verbose';
  message?: string;
}

export function Log(options: LoggerOptions = {}) {
  const logger = new Logger(options.context);

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const methodName = `${target.constructor.name}.${propertyKey}`;
      const context = options.context || target.constructor.name;
      
      try {
        // 记录方法调用
        if (options.logArgs) {
          logger[options.level || 'log'](`${methodName} called with args:`, args);
        }

        // 执行原始方法
        const result = await originalMethod.apply(this, args);

        // 记录返回结果
        if (options.logResult) {
          logger[options.level || 'log'](`${methodName} returned:`, result);
        }

        return result;
      } catch (error) {
        logger.error(`${methodName} threw error:`, error);
        throw error;
      }
    };

    return descriptor;
  };
}