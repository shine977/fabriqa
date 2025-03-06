import { Controller, Post, Body, Param, Delete, Put, Get, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PluginManager } from '../services/plugin.manager';
import { PluginDto, InstallPluginDto } from '../dto/plugin.dto';
import { PluginStatus } from '../types/plugin.type';

@ApiTags('Plugins')
@Controller('plugins')
export class PluginController {
  constructor(private readonly pluginManager: PluginManager) {}

  @Get()
  @ApiOperation({ summary: '获取所有插件' })
  @ApiResponse({ status: 200, type: [PluginDto] })
  async getAllPlugins(@Query('status') status?: PluginStatus) {
    const plugins = await this.pluginManager.getAllPluginInfos();
    return status ? plugins.filter(p => p.status === status) : plugins;
  }

  @Get(':id')
  @ApiOperation({ summary: '获取插件详情' })
  @ApiResponse({ status: 200, type: PluginDto })
  async getPlugin(@Param('id') id: string) {
    return this.pluginManager.getPluginInfo(id);
  }

  @Put(':id/install')
  @ApiOperation({ summary: '安装插件' })
  @HttpCode(HttpStatus.OK)
  async installPlugin(@Param('id') id: string, @Body() installDto: InstallPluginDto) {
    await this.pluginManager.installPlugin(id, {
      config: installDto.config,
      triggeredBy: 'api',
      timestamp: new Date(),
    });
    return { success: true };
  }

  @Post(':id/enable')
  @ApiOperation({ summary: '启用插件' })
  @HttpCode(HttpStatus.OK)
  async enablePlugin(@Param('id') id: string) {
    await this.pluginManager.enablePlugin(id, {
      triggeredBy: 'api',
      timestamp: new Date(),
    });
    return { success: true };
  }

  @Post(':id/disable')
  @ApiOperation({ summary: '禁用插件' })
  @HttpCode(HttpStatus.OK)
  async disablePlugin(@Param('id') id: string) {
    await this.pluginManager.disablePlugin(id, {
      triggeredBy: 'api',
      timestamp: new Date(),
    });
    return { success: true };
  }

  @Delete(':id')
  @ApiOperation({ summary: '卸载插件' })
  @HttpCode(HttpStatus.OK)
  async uninstallPlugin(@Param('id') id: string) {
    await this.pluginManager.uninstallPlugin(id, {
      triggeredBy: 'api',
      timestamp: new Date(),
    });
    return { success: true };
  }
}
