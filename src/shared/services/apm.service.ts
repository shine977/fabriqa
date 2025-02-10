// src/shared/services/apm.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as apm from 'elastic-apm-node';

@Injectable()
export class ApmService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    if (this.configService.get('APM_ENABLED') === 'true') {
      apm.start({
        serviceName: 'injecting-admin',
        serverUrl: this.configService.get('APM_SERVER_URL'),
        environment: this.configService.get('NODE_ENV'),
        active: true,
        captureBody: 'all',
        captureErrorLogStackTraces: 'always',
      });
    }
  }

  startTransaction(name: string, type: string) {
    return apm.startTransaction(name, type);
  }

  captureError(error: Error) {
    return apm.captureError(error);
  }

  setCustomContext(context: Record<string, any>) {
    apm.setCustomContext(context);
  }
}
