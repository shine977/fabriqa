import { SetMetadata } from '@nestjs/common';
import { PLUGIN_SERVICE_METADATA } from './inject.decorator';

// export const PLUGIN_SERVICE_METADATA = 'plugin:service';

export interface PluginServiceOptions {
  name?: string;
  description?: string;
  version?: string;
}

export const PluginService = (options: PluginServiceOptions = {}) => {
  return (target: any) => {
    Reflect.defineMetadata(PLUGIN_SERVICE_METADATA, options, target);
    return target;
  };
};
