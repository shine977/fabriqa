import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PluginManager } from '../services/plugin.manager';
import { PluginConfigManager } from '../services/plugin.config-manager';
import { PluginRegistry } from '../services/plugin.registry';
import { AuthGuard } from '@nestjs/passport';

@Controller('plugins')
@UseGuards(AuthGuard('jwt'))
export class PluginController {
  constructor(
    private readonly pluginManager: PluginManager,
    private readonly configManager: PluginConfigManager,
    private readonly pluginRegistry: PluginRegistry,
  ) {}

  @Get()
  async listPlugins(@Query('tenantId') tenantId?: string) {
    const plugins = await this.pluginRegistry.listPlugins();
    return plugins.map(plugin => ({
      id: plugin.metadata.pluginId,
      name: plugin.metadata.name,
      version: plugin.metadata.version,
      description: plugin.metadata.description,
      author: plugin.metadata.author,
      state: plugin.getState?.() || 'unknown',
    }));
  }

  @Post(':id/install')
  async installPlugin(@Param('id') id: string, @Query('tenantId') tenantId?: string) {
    const context = { tenantId };
    await this.pluginManager.installPlugin(id, context);
    return { success: true };
  }

  @Post(':id/uninstall')
  async uninstallPlugin(@Param('id') id: string, @Query('tenantId') tenantId?: string) {
    const context = { tenantId };
    await this.pluginManager.uninstallPlugin(id, context);
    return { success: true };
  }

  @Post(':id/enable')
  async enablePlugin(@Param('id') id: string, @Query('tenantId') tenantId?: string) {
    const context = { tenantId };
    await this.pluginManager.enablePlugin(id, context);
    return { success: true };
  }

  @Post(':id/disable')
  async disablePlugin(@Param('id') id: string, @Query('tenantId') tenantId?: string) {
    const context = { tenantId };
    await this.pluginManager.disablePlugin(id, context);
    return { success: true };
  }

  @Get(':id/config')
  async getPluginConfig(@Param('id') id: string, @Query('tenantId') tenantId?: string) {
    const plugin = await this.pluginRegistry.getPlugin(id);
    if (!plugin) {
      throw new Error(`Plugin not found: ${id}`);
    }
    return await this.configManager.getConfig(plugin);
  }

  @Put(':id/config')
  async updatePluginConfig(
    @Param('id') id: string,
    @Body() config: Record<string, any>,
    @Query('tenantId') tenantId?: string,
  ) {
    const plugin = await this.pluginRegistry.getPlugin(id);
    if (!plugin) {
      throw new Error(`Plugin not found: ${id}`);
    }
    await this.configManager.updateConfig(plugin, config);
    return { success: true };
  }

  @Delete(':id/config')
  async deletePluginConfig(@Param('id') id: string, @Query('tenantId') tenantId?: string) {
    const plugin = await this.pluginRegistry.getPlugin(id);
    if (!plugin) {
      throw new Error(`Plugin not found: ${id}`);
    }
    await this.configManager.deleteConfig(plugin);
    return { success: true };
  }
}
