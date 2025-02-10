import { PluginType } from '@core/plugin';
import { Type } from '@nestjs/common';

export interface PluginDefinition {
  module: Type<any>;
  enabled: boolean;
  order: number;
  type: PluginType;
  dependencies?: string[];
}
