// src/shared/services/telemetry.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ConfigService } from '@nestjs/config';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

@Injectable()
export class TelemetryService implements OnModuleInit {
  private sdk: NodeSDK;
  private tracer: any;

  constructor(private configService: ConfigService) {
    const jaegerExporter = new JaegerExporter({
      endpoint: this.configService.get('JAEGER_ENDPOINT'),
    });

    const prometheusExporter = new PrometheusExporter({
      port: 9464,
    });

    this.sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'injecting-admin',
        [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: this.configService.get('NODE_ENV'),
      }),
      spanProcessor: new BatchSpanProcessor(jaegerExporter),
      metricReader: prometheusExporter,
      instrumentations: [getNodeAutoInstrumentations()],
    });

    // 获取tracer实例
    this.tracer = trace.getTracer('injecting-admin-tracer');
  }

  async onModuleInit() {
    if (this.configService.get('TELEMETRY_ENABLED') === 'true') {
      await this.sdk.start();
      console.log('Telemetry service started');
    }
  }

  // 创建一个新的span
  createSpan(name: string, fn: () => Promise<any>) {
    return this.tracer.startActiveSpan(name, async (span: any) => {
      try {
        const result = await fn();
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
  }

  // 添加属性到当前span
  addAttribute(key: string, value: string) {
    const currentSpan = trace.getSpan(context.active());
    if (currentSpan) {
      currentSpan.setAttribute(key, value);
    }
  }

  // 记录事件
  recordEvent(name: string, attributes?: Record<string, any>) {
    const currentSpan = trace.getSpan(context.active());
    if (currentSpan) {
      currentSpan.addEvent(name, attributes);
    }
  }

  async onApplicationShutdown() {
    await this.sdk.shutdown();
    console.log('Telemetry service stopped');
  }
}
