// src/shared/services/alert.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface AlertConfig {
  threshold: number;
  timeWindow: number;
  channels: string[];
}

@Injectable()
export class AlertService {
  private errorCount: Map<string, number> = new Map();
  private readonly alertConfigs: Record<string, AlertConfig>;

  constructor(private configService: ConfigService) {
    this.alertConfigs = {
      error: {
        threshold: this.configService.get('ALERT_ERROR_THRESHOLD', 10),
        timeWindow: this.configService.get('ALERT_ERROR_TIME_WINDOW', 300000), // 5 minutes
        channels: this.configService.get('ALERT_CHANNELS', 'email,slack').split(','),
      },
    };
  }

  async handleError(error: Error, context: string) {
    const key = `${context}:${error.name}`;
    const currentCount = (this.errorCount.get(key) || 0) + 1;
    this.errorCount.set(key, currentCount);

    const config = this.alertConfigs.error;
    if (currentCount >= config.threshold) {
      await this.sendAlert({
        type: 'error',
        message: `Error threshold exceeded: ${error.message}`,
        context,
        count: currentCount,
      });
      this.errorCount.delete(key);
    }

    // Reset count after time window
    setTimeout(() => {
      this.errorCount.delete(key);
    }, config.timeWindow);
  }

  private async sendAlert(alert: any) {
    // 实现具体的告警发送逻辑，例如：
    // - 发送邮件
    // - 发送 Slack 消息
    // - 触发 Webhook
    // - 写入告警日志
    console.log('Alert sent:', alert);
  }
}
