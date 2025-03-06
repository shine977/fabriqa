// src/shared/services/notification/notification.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SlackChannel } from './channels/slack.channel';
import { EmailChannel } from './channels/email.channel';
import { NotificationChannel } from './notification.interface';

@Injectable()
export class NotificationService {
  private channels: Map<string, NotificationChannel> = new Map();

  constructor(
    private configService: ConfigService,
    private slackChannel: SlackChannel,
    private emailChannel: EmailChannel,
  ) {
    this.channels.set('slack', slackChannel);
    this.channels.set('email', emailChannel);
  }

  async notify(message: string, level: string = 'info'): Promise<void> {
    const enabledChannels = this.configService.get('ALERT_CHANNELS').split(',');

    await Promise.all(
      enabledChannels.map(async (channel) => {
        const notifier = this.channels.get(channel.trim());
        if (notifier) {
          await notifier.send(message, level);
        }
      }),
    );
  }
}
