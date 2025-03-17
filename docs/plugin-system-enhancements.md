# Plugin System Enhancements

## Overview

This document outlines the enhancements made to the Fabriqa plugin system, transitioning from the legacy `pluginSystem` to the more robust and flexible `ApplicationPlugin` architecture. These improvements provide better TypeScript support, improved hook management, and enhanced plugin registration capabilities.

## Table of Contents

1. [Architecture Changes](#architecture-changes)
2. [Key Components](#key-components)
3. [Implementation Details](#implementation-details)
4. [Migration Guide](#migration-guide)
5. [Best Practices](#best-practices)
6. [NestJS Integration](#nestjs-integration)

## Architecture Changes

### Previous Architecture

The legacy plugin system had several limitations:
- Limited TypeScript support
- Unclear plugin registration process
- Rigid hook system with inadequate error handling
- Poor integration with NestJS dependency injection

### New Architecture

The enhanced plugin system offers:
- **Type-Safe Plugins**: Comprehensive TypeScript definitions
- **Flexible Hook System**: Better hook management with proper error handling
- **Improved Plugin Registration**: Streamlined plugin registration process
- **NestJS Integration**: Proper module structure with dependency injection support

## Key Components

### 1. ApplicationPlugin (`ApplicationPlugin.ts`)

The core plugin class that provides hook registration and execution:

- `registerPlugin`: Registers a new plugin
- `applyHooks`: Executes hooks with proper error handling
- `getPlugin`: Retrieves a plugin by name

### 2. Plugin System Module (`plugin-system.module.ts`)

NestJS module for integrating the plugin system with the application:

- Provides `PluginRegistry` service
- Exports necessary services for use in other modules

### 3. Plugin Registry (`plugin.registry.ts`)

Service for managing plugins in the NestJS environment:

- Register plugins
- Retrieve plugin information
- Manage plugin lifecycle

## Implementation Details

### ApplicationPlugin

```typescript
// ApplicationPlugin.ts
export class ApplicationPlugin {
  private plugins: Record<string, Plugin> = {};
  
  registerPlugin(plugin: Plugin): void {
    if (this.plugins[plugin.name]) {
      console.warn(`Plugin ${plugin.name} already registered. It will be overwritten.`);
    }
    this.plugins[plugin.name] = plugin;
  }
  
  applyHooks<T>(hookName: string, defaultValue: T, ...args: any[]): T {
    let result = defaultValue;
    
    for (const pluginName in this.plugins) {
      const plugin = this.plugins[pluginName];
      if (plugin.hooks && plugin.hooks[hookName]) {
        try {
          result = plugin.hooks[hookName](result, ...args);
        } catch (error) {
          console.error(`Error executing hook ${hookName} in plugin ${pluginName}:`, error);
        }
      }
    }
    
    return result;
  }
  
  getPlugin(name: string): Plugin | undefined {
    return this.plugins[name];
  }
}

export const appPlugin = new ApplicationPlugin();
```

### Plugin System Module

```typescript
// plugin-system.module.ts
import { Module } from '@nestjs/common';
import { PluginRegistry } from './services/plugin.registry';

@Module({
  providers: [PluginRegistry],
  exports: [PluginRegistry]
})
export class PluginSystemModule {}
```

### Plugin Registry

```typescript
// plugin.registry.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class PluginRegistry {
  private plugins: Record<string, any> = {};
  
  registerPlugin(name: string, plugin: any): void {
    this.plugins[name] = plugin;
  }
  
  getPlugin(name: string): any {
    return this.plugins[name];
  }
  
  getAllPlugins(): Record<string, any> {
    return this.plugins;
  }
}
```

## Migration Guide

### Updating Imports

**Before:**

```typescript
import { pluginSystem } from '../plugins/pluginSystem';
```

**After:**

```typescript
import { appPlugin } from '../plugins/ApplicationPlugin';
```

### Registering Plugins

**Before:**

```typescript
pluginSystem.registerPlugin({
  name: 'myPlugin',
  hooks: {
    'layout:theme': (theme) => ({ ...theme, mode: 'dark' })
  }
});
```

**After:**

```typescript
appPlugin.registerPlugin({
  name: 'myPlugin',
  hooks: {
    'layout:theme': (theme) => ({ ...theme, mode: 'dark' })
  }
});
```

### Using Hooks

**Before:**

```typescript
const theme = pluginSystem.callHooks('layout:theme', defaultTheme);
```

**After:**

```typescript
const theme = appPlugin.applyHooks('layout:theme', defaultTheme);
```

## Best Practices

1. **Hook Naming Conventions**:
   - Use namespaced hook names (`component:action`)
   - Be consistent with hook naming
   - Document hook purposes and parameters

2. **Plugin Structure**:
   - Keep plugins focused and single-purpose
   - Document plugin dependencies
   - Clear separation of concerns

3. **Error Handling**:
   - Always handle hook errors gracefully
   - Provide default values for hooks
   - Log and monitor hook execution

4. **Type Safety**:
   - Define interfaces for hook parameters and return values
   - Use TypeScript generics for type-safe hook execution
   - Document expected types

## NestJS Integration

### Dependency Injection

To properly integrate with NestJS dependency injection:

1. **Module Registration**:
   ```typescript
   // app.module.ts
   @Module({
     imports: [PluginSystemModule, WorkflowModule],
     // ...
   })
   export class AppModule {}
   ```

2. **Resolving Circular Dependencies**:
   
   When modules have circular dependencies, use `forwardRef()`:
   
   ```typescript
   // workflow.module.ts
   @Module({
     imports: [forwardRef(() => PluginSystemModule)],
     // ...
   })
   export class WorkflowModule {}
   
   // In service with circular dependency
   @Injectable()
   export class WorkflowCompiler {
     constructor(
       @Inject(forwardRef(() => PluginRegistry))
       private readonly pluginRegistry: PluginRegistry
     ) {}
   }
   ```

3. **Provider Exports**:
   
   Ensure services are properly exported from their modules:
   
   ```typescript
   // plugin-system.module.ts
   @Module({
     providers: [PluginRegistry],
     exports: [PluginRegistry]
   })
   export class PluginSystemModule {}
   ```

### Plugin Loading

The plugin loader service provides a standardized way to load plugins:

```typescript
// plugin.loader.ts
@Injectable()
export class PluginLoader {
  constructor(private readonly pluginRegistry: PluginRegistry) {}
  
  load(plugins: any[]): void {
    for (const plugin of plugins) {
      this.pluginRegistry.registerPlugin(plugin.name, plugin);
    }
  }
}
```

---

*This documentation was last updated on March 17, 2025.*