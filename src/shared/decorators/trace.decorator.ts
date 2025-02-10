// src/shared/decorators/trace.decorator.ts
import { SpanStatusCode, trace } from '@opentelemetry/api';

export function Trace(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const tracer = trace.getTracer('injecting-admin-tracer');

    descriptor.value = async function (...args: any[]) {
      const spanName = name || `${target.constructor.name}.${propertyKey}`;

      return tracer.startActiveSpan(spanName, async (span: any) => {
        try {
          const result = await originalMethod.apply(this, args);
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
          span.recordException(error);
          throw error;
        } finally {
          span.end();
        }
      });
    };

    return descriptor;
  };
}
