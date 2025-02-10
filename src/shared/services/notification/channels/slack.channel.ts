// src/shared/services/notification/channels/slack.channel.ts
import { Injectable } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel } from '../notification.interface';

@Injectable()
export class SlackChannel implements NotificationChannel {
  private client: WebClient;

  constructor(private configService: ConfigService) {
    this.client = new WebClient(this.configService.get('SLACK_TOKEN'));
  }

  async send(message: string, level: string): Promise<void> {
    const channel = this.configService.get('SLACK_CHANNEL');
    await this.client.chat.postMessage({
      channel,
      text: `[${level.toUpperCase()}] ${message}`,
    });
  }
}
