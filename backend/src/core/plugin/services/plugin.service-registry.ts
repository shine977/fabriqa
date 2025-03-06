import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService, ModuleRef } from '@nestjs/core';
import { PluginServiceOptions } from '../decorators/plugin-service.decorator';
import 'reflect-metadata';
import { PLUGIN_SERVICE_METADATA } from '../decorators/inject.decorator';
import { PluginRegistry } from './plugin.registry';
import { PluginManager } from './plugin.manager';
import { PluginLoader } from './plugin.loader';
import { PluginLifecycleManager } from './plugin.lifecycle-manager';
import { PluginEventBus } from './plugin.event-bus';
import { PluginSecurityManager } from './plugin.security-manager';
import { PluginConfigManager } from './plugin.config-manager';

@Injectable()
export class PluginServiceRegistry {
  private readonly logger = new Logger(PluginServiceRegistry.name);
  private serviceMap = new Map<string, any>();
  private initialized = false;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly moduleRef: ModuleRef,
  ) {}

  async ensureInitialized() {
    if (this.initialized) {
      return;
    }

    try {
      // 发现和注册服务
      await this.discoverAndRegisterServices();

      this.initialized = true;
      this.logger.log(`Initialized plugin service registry with ${this.serviceMap.size} services`);
    } catch (error) {
      this.logger.error(`Failed to initialize service registry: ${error.message}`);
      throw error;
    }
  }

  private async discoverAndRegisterServices() {
    const providers = await this.discoveryService.getProviders();
    const pluginServices = providers.filter(provider => {
      if (!provider.metatype) return false;
      try {
        const metadata = Reflect.getMetadata(PLUGIN_SERVICE_METADATA, provider.metatype);
        return metadata !== undefined;
      } catch (error) {
        return false;
      }
    });

    // 注册内置服务
    const builtInServices = [
      PluginRegistry,
      PluginManager,
      PluginLoader,
      PluginLifecycleManager,
      PluginEventBus,
      PluginSecurityManager,
      PluginConfigManager,
      PluginServiceRegistry,
    ];

    for (const ServiceClass of builtInServices) {
      try {
        const instance = await this.moduleRef.resolve(ServiceClass);
        if (instance) {
          this.registerService(ServiceClass.name, instance);
          this.logger.debug(`Registered built-in service: ${ServiceClass.name}`);
        }
      } catch (error) {
        this.logger.warn(`Failed to register built-in service ${ServiceClass.name}: ${error.message}`);
      }
    }

    // 注册其他服务
    for (const provider of pluginServices) {
      try {
        const metadata: PluginServiceOptions = Reflect.getMetadata(PLUGIN_SERVICE_METADATA, provider.metatype);
        const serviceName = metadata?.name || provider.metatype.name;
        const instance = this.moduleRef.get(provider.metatype, { strict: false });
        if (instance) {
          this.registerService(serviceName, instance);
          this.logger.debug(`Registered plugin service: ${serviceName}`);
        }
      } catch (error) {
        this.logger.warn(`Failed to register service ${provider.metatype?.name}: ${error.message}`);
      }
    }
  }

  registerService(name: string, instance: any): void {
    if (this.serviceMap.has(name)) {
      this.logger.warn(`Service ${name} already registered, overwriting...`);
    }
    this.serviceMap.set(name, instance);
  }

  getService<T = any>(name: string): T {
    if (!this.serviceMap.has(name)) {
      throw new Error(`Service not found: ${name}`);
    }
    return this.serviceMap.get(name);
  }

  hasService(name: string): boolean {
    return this.serviceMap.has(name);
  }

  getAllServices(): Map<string, any> {
    return new Map(this.serviceMap);
  }
}
