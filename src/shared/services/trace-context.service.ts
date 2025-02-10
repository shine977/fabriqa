// src/shared/services/trace-context.service.ts
import { Injectable } from '@nestjs/common';
import * as cls from 'cls-hooked';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TraceContextService {
  private readonly namespace: cls.Namespace;

  constructor() {
    this.namespace = cls.createNamespace('trace');
  }

  getTraceId(): string {
    return this.namespace.get('traceId');
  }

  async run(fn: () => Promise<any>): Promise<any> {
    return this.namespace.runAndReturn(async () => {
      const traceId = uuidv4();
      this.namespace.set('traceId', traceId);
      return fn();
    });
  }
}
