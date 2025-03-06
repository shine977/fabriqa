// src/core/plugin/decorators/inject.decorator.ts
import 'reflect-metadata';
import { PluginDependencyType, PluginDependencyMetadata } from '../types/dependency.type';

export const PLUGIN_DEPS_METADATA = 'plugin:dependencies';
export const CONSTRUCTOR_DEPS_METADATA = 'plugin:constructor:dependencies';
export const PLUGIN_SERVICE_METADATA = 'plugin:service';
export const INJECT_METADATA = 'plugin:inject';

export interface InjectMetadata {
  serviceName: string;
  optional?: boolean;
}

export function InjectService(serviceName: string, optional = false) {
  return function (target: any, _propertyKey: string | symbol | undefined, parameterIndex: number) {
    const existingMetadata = Reflect.getMetadata(INJECT_METADATA, target) || [];

    // 确保元数据是数组形式
    const metadata = Array.isArray(existingMetadata) ? existingMetadata : [];

    // 保存服务名称到对应的参数位置
    metadata[parameterIndex] = serviceName;

    // 更新类级别的元数据
    Reflect.defineMetadata(INJECT_METADATA, metadata, target);
  };
}

export function InjectPlugin(pluginId: string, optional = false) {
  return createInjectDecorator({
    type: PluginDependencyType.PLUGIN,
    name: pluginId,
    optional,
  });
}

function createInjectDecorator(metadata: PluginDependencyMetadata) {
  return function (target: any, _: string, parameterIndex: number) {
    const deps = Reflect.getMetadata(CONSTRUCTOR_DEPS_METADATA, target) || [];
    deps[parameterIndex] = metadata;
    Reflect.defineMetadata(CONSTRUCTOR_DEPS_METADATA, deps, target);
  };
}
