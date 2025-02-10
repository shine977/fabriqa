// src/shared/services/notification/notification.interface.ts
export interface NotificationChannel {
  send(message: string, level: string): Promise<void>;
}
