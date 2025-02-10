// src/core/plugin/exceptions/plugin.exception.ts
export class PluginException extends Error {
  constructor(
    message: string,
    public readonly pluginId?: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'PluginException';
  }
}

export class PluginNotFoundException extends PluginException {
  constructor(pluginId: string) {
    super(`Plugin not found: ${pluginId}`, pluginId, 'PLUGIN_NOT_FOUND');
  }
}

export class PluginDependencyException extends PluginException {
  constructor(pluginId: string, dependencyId: string) {
    super(
      `Plugin dependency not satisfied: ${dependencyId} for plugin ${pluginId}`,
      pluginId,
      'PLUGIN_DEPENDENCY_ERROR',
    );
  }
}
