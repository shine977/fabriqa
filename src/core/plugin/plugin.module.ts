import { DynamicModule, Global, Injectable, Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PluginEntity } from './entities/plugin.entity';
import { PluginManager } from './services/plugin.manager';
import { PluginLoader } from './services/plugin.loader';
import { PluginRegistry } from './services/plugin.registry';
import { PluginDependencyResolver } from './services/plugin.dependency-resolver';
import { PluginLifecycleManager } from './services/plugin.lifecycle-manager';
import { PluginSecurityManager } from './services/plugin.security-manager';
import { PluginConfigManager } from './services/plugin.config-manager';
import { PluginEventBus } from './services/plugin.event-bus';
import { DiscoveryModule } from '@nestjs/core';
import { PluginServiceRegistry } from './services/plugin.service-registry';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PluginOptions, PluginConfig } from './types/plugin.type';

@Injectable()
export class PluginInitializer {
  constructor(private readonly serviceRegistry: PluginServiceRegistry) {}

  async onModuleInit() {
    await this.serviceRegistry.ensureInitialized();
  }
}

@Global()
@Module({
  imports: [
    DiscoveryModule,
    EventEmitterModule.forRoot({
      // 全局事件配置
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
  ],
  providers: [
    PluginServiceRegistry,
    PluginInitializer,
    PluginDependencyResolver,
    PluginManager,
    PluginLoader,
    PluginRegistry,
    PluginLifecycleManager,
    PluginEventBus,
    PluginSecurityManager,
    PluginConfigManager,
  ],
  exports: [
    PluginManager,
    PluginRegistry,
    PluginDependencyResolver,
    PluginLoader,
    PluginServiceRegistry,
    PluginEventBus,
    PluginConfigManager,
  ],
})
export class PluginModule {
  static forRoot(options: PluginOptions = {}): DynamicModule {
    const defaultConfig: PluginConfig = {
      pluginDir: 'plugins',
      maxConcurrentLoads: 5,
      autoDiscovery: true,
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000,
      systemPlugins: [],
    };
    const config = { ...defaultConfig, ...options };
    return {
      module: PluginModule,
      imports: [DiscoveryModule, TypeOrmModule.forFeature([PluginEntity]), EventEmitterModule.forRoot()],
      providers: [...this.createProviders(config)],
      exports: [
        PluginManager,
        PluginRegistry,
        PluginDependencyResolver,
        PluginLoader,
        PluginServiceRegistry,
        PluginEventBus,
        PluginConfigManager,
      ],
    };
  }

  private static createProviders(config: PluginConfig): Provider[] {
    return [
      {
        provide: 'PLUGIN_CONFIG',
        useValue: {
          pluginDir: config.pluginDir || 'plugins',
          systemPlugins: config.systemPlugins || [],
          maxConcurrentLoads: config.maxConcurrentLoads || 5,
          ...config,
        } as PluginConfig,
      },
    ];
  }
}
