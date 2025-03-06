// src/shared/services/notification/channels/email.channel.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { NotificationChannel } from '../notification.interface';

@Injectable()
export class EmailChannel implements NotificationChannel {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async send(message: string, level: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM'),
      to: this.configService.get('ALERT_EMAIL_TO'),
      subject: `[${level.toUpperCase()}] Alert from injecting-admin`,
      text: message,
    });
  }
}
