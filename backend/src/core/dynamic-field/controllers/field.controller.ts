// src/core/dynamic-field/controllers/field.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FieldService } from '../services/field.service';
import { FieldTemplateService } from '../services/field-template.service';
import { FieldImportExportService } from '../services/field-import-export.service';
import { FieldAuditService } from '../services/field-audit.service';
import { CreateFieldDefinitionDto, UpdateFieldDefinitionDto } from '../dto/field-definition.dto';
import { SaveFieldValuesDto } from '../dto/field-value.dto';

import { User } from '@shared/decorators/user.decorator';
import { RequirePermissions } from '@core/permission/decorators/require.permissions.decorator';
import { CreateFieldTemplateDto, UpdateFieldTemplateDto } from '../dto/field-template.dto';

@ApiTags('Dynamic Fields')
@Controller('fields')
// @UseGuards(FieldPermissionGuard)
export class FieldController {
  constructor(
    private readonly fieldService: FieldService,
    private readonly templateService: FieldTemplateService,
    private readonly importExportService: FieldImportExportService,
    private readonly auditService: FieldAuditService,
  ) {}

  @Get('modules/:moduleId')
  @ApiOperation({ summary: 'Get all fields for a module' })
  @RequirePermissions(['field:view'])
  async getModuleFields(@Param('moduleId') moduleId: string, @User('tenantId') tenantId: string) {
    return this.fieldService.getModuleFields({ tenantId, moduleId });
  }

  @Post('modules/:moduleId')
  @ApiOperation({ summary: 'Create a new field' })
  @RequirePermissions(['field:manage'])
  async createField(
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateFieldDefinitionDto,
    @User('tenantId') tenantId: string,
  ) {
    return this.fieldService.upsertField({ tenantId, moduleId }, dto);
  }

  @Put('modules/:moduleId/:fieldId')
  @ApiOperation({ summary: 'Update a field' })
  @RequirePermissions(['field:manage'])
  async updateField(
    @Param('moduleId') moduleId: string,
    @Param('fieldId') fieldId: string,
    @Body() dto: UpdateFieldDefinitionDto,
    @User('tenantId') tenantId: string,
  ) {
    return this.fieldService.upsertField({ tenantId, moduleId }, dto);
  }

  @Post('modules/:moduleId/values')
  @ApiOperation({ summary: 'Save field values' })
  @RequirePermissions(['field:edit'])
  async saveFieldValues(
    @Param('moduleId') moduleId: string,
    @Body() dto: SaveFieldValuesDto,
    @User('tenantId') tenantId: string,
    @User('id') userId: string,
  ) {
    await this.fieldService.saveFieldValues({ tenantId, moduleId }, dto.entityId, dto.values, userId);
    return { success: true };
  }

  @Get('modules/:moduleId/values/:entityId')
  @ApiOperation({ summary: 'Get field values for an entity' })
  @RequirePermissions(['field:view'])
  async getFieldValues(
    @Param('moduleId') moduleId: string,
    @Param('entityId') entityId: string,
    @User('tenantId') tenantId: string,
  ) {
    return this.fieldService.getFieldValues({ tenantId, moduleId }, entityId);
  }

  @Post('modules/:moduleId/template/:templateId')
  @ApiOperation({ summary: 'Apply a field template' })
  @RequirePermissions(['field:manage'])
  async applyTemplate(
    @Param('moduleId') moduleId: string,
    @Param('templateId') templateId: string,
    @User('tenantId') tenantId: string,
  ) {
    await this.templateService.applyTemplate({ tenantId, moduleId }, templateId);
    return { success: true };
  }

  @Get('modules/:moduleId/audit/:entityId')
  @ApiOperation({ summary: 'Get field audit logs' })
  @RequirePermissions(['field:audit'])
  async getFieldAuditLogs(
    @Param('moduleId') moduleId: string,
    @Param('entityId') entityId: string,
    @Query('fieldId') fieldId: string,
    @User('tenantId') tenantId: string,
  ) {
    return this.auditService.getFieldHistory({ tenantId, moduleId }, entityId, fieldId);
  }

  @Post('modules/:moduleId/export')
  @ApiOperation({ summary: 'Export field values' })
  @RequirePermissions(['field:export'])
  async exportFieldValues(
    @Param('moduleId') moduleId: string,
    @Body() entityIds: string[],
    @User('tenantId') tenantId: string,
  ) {
    return this.importExportService.exportFieldValues({ tenantId, moduleId }, entityIds);
  }
  // 获取所有字段模板
  @Get('templates')
  @ApiOperation({ summary: 'Get all field templates' })
  @RequirePermissions(['field:template:view'])
  async getTemplates(@User('tenantId') tenantId: string, @Query('moduleType') moduleType?: string) {
    return this.templateService.getTemplates(tenantId, moduleType);
  }

  // 获取单个模板详情
  @Get('templates/:templateId')
  @ApiOperation({ summary: 'Get template detail' })
  @RequirePermissions(['field:template:view'])
  async getTemplate(@Param('templateId') templateId: string, @User('tenantId') tenantId: string) {
    return this.templateService.getTemplate(tenantId, templateId);
  }

  // 创建字段模板
  @Post('templates')
  @ApiOperation({ summary: 'Create field template' })
  @RequirePermissions(['field:template:manage'])
  async createTemplate(@Body() dto: CreateFieldTemplateDto, @User('tenantId') tenantId: string) {
    return this.templateService.createTemplate(tenantId, dto);
  }

  // 更新字段模板
  @Put('templates/:templateId')
  @ApiOperation({ summary: 'Update field template' })
  @RequirePermissions(['field:template:manage'])
  async updateTemplate(
    @Param('templateId') templateId: string,
    @Body() dto: UpdateFieldTemplateDto,
    @User('tenantId') tenantId: string,
  ) {
    return this.templateService.updateTemplate(tenantId, templateId, dto);
  }

  // 删除字段模板
  @Delete('templates/:templateId')
  @ApiOperation({ summary: 'Delete field template' })
  @RequirePermissions(['field:template:manage'])
  async deleteTemplate(@Param('templateId') templateId: string, @User('tenantId') tenantId: string) {
    await this.templateService.deleteTemplate(tenantId, templateId);
    return { success: true };
  }

  // 克隆字段模板
  @Post('templates/:templateId/clone')
  @ApiOperation({ summary: 'Clone field template' })
  @RequirePermissions(['field:template:manage'])
  async cloneTemplate(
    @Param('templateId') templateId: string,
    @Body('name') name: string,
    @User('tenantId') tenantId: string,
  ) {
    return this.templateService.cloneTemplate(tenantId, templateId, name);
  }

  // 导出字段模板
  @Get('templates/:templateId/export')
  @ApiOperation({ summary: 'Export field template' })
  @RequirePermissions(['field:template:export'])
  async exportTemplate(@Param('templateId') templateId: string, @User('tenantId') tenantId: string) {
    return this.templateService.exportTemplate(tenantId, templateId);
  }

  // 导入字段模板
  @Post('templates/import')
  @ApiOperation({ summary: 'Import field template' })
  @RequirePermissions(['field:template:manage'])
  async importTemplate(@Body() template: CreateFieldTemplateDto, @User('tenantId') tenantId: string) {
    return this.templateService.importTemplate(tenantId, template);
  }
}
