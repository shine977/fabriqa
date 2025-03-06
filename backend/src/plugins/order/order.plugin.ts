// src/plugins/order/order.plugin.ts
import { Injectable, Logger } from '@nestjs/common';

import { ApplicationPlugin, PluginContext, PluginMetadata } from '@core/plugin';
import { FieldDefinition } from '@core/dynamic-field/interfaces/field.interface';
import { FieldType } from '@core/dynamic-field/types/field.types';
import { FieldTemplateEntity } from '@core/dynamic-field';
import { ExcelImportService } from './services/excel-import.service';
import { ExcelParser } from './interfaces/excel-parser.interface';
import { DefaultExcelParser } from './parsers/default-excel-parser';

@Injectable()
export class OrderPlugin extends ApplicationPlugin {
  private readonly logger = new Logger(OrderPlugin.name);
  metadata: PluginMetadata;

  constructor(
    private readonly excelImportService: ExcelImportService,
    private readonly defaultExcelParser: DefaultExcelParser,
  ) {
    super();
    this.registerExcelParser(this.defaultExcelParser);
  }
  // 提供注册新解析器的方法
  registerExcelParser(parser: ExcelParser) {
    this.excelImportService.registerParser(parser);
  }

  // 提供 Excel 导入方法
  async importExcel(file: Express.Multer.File) {
    return this.excelImportService.importExcel(file);
  }
  onError(context: PluginContext, error: Error): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getConfig(): Record<string, any> {
    throw new Error('Method not implemented.');
  }
  getName(): string {
    return 'order';
  }

  getDescription(): string {
    return 'Order management plugin';
  }
  /**
   * 订单创建后的钩子
   */
  async onOrderCreated(order: any, context: PluginContext): Promise<void> {
    try {
      // 记录订单创建事件
      this.logger.log(`Order created: ${order.id}`, {
        tenantId: context.tenantId,
        orderId: order.id,
        timestamp: new Date(),
        event: 'order.created',
      });

      // 这里可以添加其他订单创建后的处理逻辑
      // 例如：发送通知、更新统计数据等
    } catch (error) {
      this.logger.error(`Error in onOrderCreated: ${error.message}`, error.stack);
      // 不抛出错误，避免影响主流程
    }
  }

  /**
   * 模板加载时的钩子
   */
  async onTemplateLoad(template: FieldTemplateEntity, context: PluginContext): Promise<FieldTemplateEntity> {
    try {
      // 记录模板加载事件
      this.logger.log(`Template loaded: ${template.id}`, {
        tenantId: context.tenantId,
        templateId: template.id,
        timestamp: new Date(),
        event: 'template.loaded',
      });

      // 这里可以对模板进行处理
      return {
        ...template,
        fields: template.fields.map(field => ({
          ...field,
          //   description: field.description || `Field: ${field.name}`,
        })),
      };
    } catch (error) {
      this.logger.error(`Error in onTemplateLoad: ${error.message}`, error.stack);
      // 出错时返回原始模板
      return template;
    }
  }
  // 实现动态字段定义
  async getFieldDefinitions(): Promise<FieldDefinition[]> {
    return [
      {
        name: 'customField1',
        label: '自定义字段1',
        type: FieldType.STRING,
        isRequired: false,
        order: 1,
      },
      {
        name: 'customField2',
        label: '自定义字段2',
        type: FieldType.NUMBER,
        isRequired: false,
        order: 2,
      },
    ];
  }

  // 可选：实现字段变更处理
  async onFieldChange(fieldName: string, oldValue: any, newValue: any): Promise<void> {
    // 处理字段值变更
    console.log(`Field ${fieldName} changed from ${oldValue} to ${newValue}`);
  }
}
