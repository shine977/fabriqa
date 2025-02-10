// src/core/plugin/services/plugin.event-bus.ts
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface PluginEvent {
  pluginId: string;
  [key: string]: any;
}

@Injectable()
export class PluginEventBus {
  private readonly logger = new Logger(PluginEventBus.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async emit(eventName: string, event: PluginEvent): Promise<void> {
    try {
      this.logger.debug(`Emitting event ${eventName} for plugin ${event.pluginId}`);
      await this.eventEmitter.emit(`plugin.${eventName}`, event);
    } catch (error) {
      this.logger.error(`Error emitting event ${eventName}: ${error.message}`);
      throw error;
    }
  }

  on(eventName: string, listener: (event: PluginEvent) => void | Promise<void>): void {
    this.eventEmitter.on(`plugin.${eventName}`, listener);
  }

  once(eventName: string, listener: (event: PluginEvent) => void | Promise<void>): void {
    this.eventEmitter.once(`plugin.${eventName}`, listener);
  }

  off(eventName: string, listener: (event: PluginEvent) => void | Promise<void>): void {
    this.eventEmitter.off(`plugin.${eventName}`, listener);
  }

  removeAllListeners(eventName?: string): void {
    if (eventName) {
      this.eventEmitter.removeAllListeners(`plugin.${eventName}`);
    } else {
      this.eventEmitter.removeAllListeners();
    }
  }
}
