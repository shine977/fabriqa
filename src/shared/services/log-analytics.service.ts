// src/shared/services/log-analytics.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { AlertService } from './alert.service';

interface LogMetrics {
  errorCount: number;
  warningCount: number;
  averageResponseTime: number;
  slowestEndpoints: Array<{ path: string; time: number }>;
  mostFrequentErrors: Array<{ message: string; count: number }>;
}

@Injectable()
export class LogAnalyticsService {
  private metrics: LogMetrics = {
    errorCount: 0,
    warningCount: 0,
    averageResponseTime: 0,
    slowestEndpoints: [],
    mostFrequentErrors: [],
  };

  private responseTimeSamples: Array<{ path: string; time: number }> = [];
  private errorMap: Map<string, number> = new Map();

  constructor(
    private configService: ConfigService,
    private alertService: AlertService,
  ) {}

  trackResponseTime(path: string, time: number) {
    this.responseTimeSamples.push({ path, time });
  }

  trackError(error: Error) {
    const count = (this.errorMap.get(error.message) || 0) + 1;
    this.errorMap.set(error.message, count);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async analyzeMetrics() {
    // 计算平均响应时间
    if (this.responseTimeSamples.length > 0) {
      const total = this.responseTimeSamples.reduce((sum, sample) => sum + sample.time, 0);
      this.metrics.averageResponseTime = total / this.responseTimeSamples.length;
    }

    // 找出最慢的端点
    this.metrics.slowestEndpoints = [...this.responseTimeSamples].sort((a, b) => b.time - a.time).slice(0, 5);

    // 最频繁的错误
    this.metrics.mostFrequentErrors = Array.from(this.errorMap.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 检查是否需要触发告警
    await this.checkAlerts();

    // 重置采样数据
    this.responseTimeSamples = [];
    this.errorMap.clear();
  }

  private async checkAlerts() {
    const slowResponseThreshold = this.configService.get('SLOW_RESPONSE_THRESHOLD', 1000);

    if (this.metrics.averageResponseTime > slowResponseThreshold) {
      await this.alertService.handleError(
        new Error(`High average response time: ${this.metrics.averageResponseTime}ms`),
        'performance',
      );
    }

    if (this.metrics.errorCount > this.configService.get('ERROR_THRESHOLD', 10)) {
      await this.alertService.handleError(
        new Error(`High error rate: ${this.metrics.errorCount} errors in the last minute`),
        'reliability',
      );
    }
  }

  getMetrics(): LogMetrics {
    return { ...this.metrics };
  }
}
