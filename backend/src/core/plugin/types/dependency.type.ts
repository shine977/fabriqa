// src/core/plugin/types/dependency.types.ts
export enum PluginDependencyType {
  SERVICE = 'service',
  PLUGIN = 'plugin',
}

export interface PluginDependencyMetadata {
  type: PluginDependencyType;
  name: string;
  optional?: boolean;
}

export interface PluginDependencyNode {
  pluginId: string;
  dependencies: string[];
  visited: boolean;
  inStack: boolean;
}
