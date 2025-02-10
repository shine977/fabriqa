import { registerAs } from '@nestjs/config';
import { PluginConfig } from '../types/plugin.type';

export default registerAs(
  'plugin',
  (): PluginConfig => ({
    pluginDir: process.env.PLUGIN_DIR || 'plugins',
    systemPlugins: ['rbac-permission'], // 默认系统插件
    maxConcurrentLoads: 5,
  }),
);
