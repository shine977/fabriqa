import { Injectable } from '@nestjs/common';
import { CreateFieldTemplateDto, UpdateFieldTemplateDto } from '../dto/field-template.dto';
import { FieldTemplateEntity } from '../entities/field-template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldService } from './field.service';
import { FieldContext, FieldDefinition } from '../interfaces/field.interface';
import { CreateFieldDefinitionDto } from '../dto/field.dto';
import { ValidationType, ValidationRule } from '../types/field.types';
import { Logger } from '@nestjs/common';

@Injectable()
export class FieldTemplateService {
  private readonly logger = new Logger(FieldTemplateService.name);

  constructor(
    @InjectRepository(FieldTemplateEntity)
    private templateRepo: Repository<FieldTemplateEntity>,
    private fieldService: FieldService,
  ) {}

  private mapValidationDto(dto: CreateFieldDefinitionDto): FieldDefinition {
    const { validations, ...rest } = dto;
    return {
      ...rest,
      validations:
        validations?.map(validation => {
          const { type, message, ...params } = validation;
          const baseValidation = { type, message };

          switch (type) {
            case ValidationType.REGEX:
              return {
                ...baseValidation,
                type: ValidationType.REGEX,
                pattern: params.pattern,
              } as ValidationRule;
            case ValidationType.RANGE:
              return {
                ...baseValidation,
                type: ValidationType.RANGE,
                min: params.min,
                max: params.max,
              } as ValidationRule;
            case ValidationType.LENGTH:
              return {
                ...baseValidation,
                type: ValidationType.LENGTH,
                min: params.min,
                max: params.max,
              } as ValidationRule;
            case ValidationType.ENUM:
              return {
                ...baseValidation,
                type: ValidationType.ENUM,
                values: params.values,
              } as ValidationRule;
            case ValidationType.CUSTOM:
              return {
                ...baseValidation,
                type: ValidationType.CUSTOM,
                function: params.function,
              } as ValidationRule;
            case ValidationType.REQUIRED:
              return {
                ...baseValidation,
                type: ValidationType.REQUIRED,
              } as ValidationRule;
            default:
              throw new Error(`Unsupported validation type: ${type}`);
          }
        }) || [],
    };
  }

  async applyTemplate(context: FieldContext, templateId: string): Promise<void> {
    const template = await this.templateRepo.findOne({
      where: {
        id: templateId,
        tenantId: context.tenantId,
        isEnabled: true,
      },
    });

    if (!template) {
      throw new Error('Template not found or disabled');
    }

    for (const field of template.fields) {
      const fieldDto: CreateFieldDefinitionDto = {
        ...field,
        metadata: {
          ...field.metadata,
          templateId: template.id,
          appliedAt: new Date(),
        },
      };
      await this.fieldService.upsertField(context, fieldDto);
    }
  }

  async getTemplates(tenantId: string, moduleType?: string): Promise<FieldTemplateEntity[]> {
    const query = this.templateRepo.createQueryBuilder('template').where('template.tenantId = :tenantId', { tenantId });

    if (moduleType) {
      query.andWhere('template.moduleType = :moduleType', { moduleType });
    }

    return query.getMany();
  }

  async getTemplate(tenantId: string, templateId: string): Promise<FieldTemplateEntity> {
    const template = await this.templateRepo.findOne({
      where: { id: templateId, tenantId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    return template;
  }

  async createTemplate(tenantId: string, dto: CreateFieldTemplateDto): Promise<FieldTemplateEntity> {
    const mappedFields = dto.fields.map(field => this.mapValidationDto(field));
    const entity = this.templateRepo.create({
      ...dto,
      tenantId,
      fields: mappedFields,
    });

    return this.templateRepo.save(entity);
  }

  async updateTemplate(
    tenantId: string,
    templateId: string,
    dto: UpdateFieldTemplateDto,
  ): Promise<FieldTemplateEntity> {
    const template = await this.getTemplate(tenantId, templateId);
    const mappedFields = dto.fields.map(field => this.mapValidationDto(field));

    Object.assign(template, {
      ...dto,
      fields: mappedFields,
    });

    return this.templateRepo.save(template);
  }

  async deleteTemplate(tenantId: string, templateId: string): Promise<void> {
    await this.templateRepo.delete({ id: templateId, tenantId });
  }

  async cloneTemplate(tenantId: string, templateId: string, newName: string): Promise<FieldTemplateEntity> {
    const template = await this.getTemplate(tenantId, templateId);
    const mappedFields = template.fields.map(field => ({
      ...field,
      id: undefined,
    }));

    const cloneDto: CreateFieldTemplateDto = {
      ...template,
      name: newName,
      fields: mappedFields,
    };

    return this.createTemplate(tenantId, cloneDto);
  }

  async exportTemplate(tenantId: string, templateId: string): Promise<Partial<FieldTemplateEntity>> {
    const template = await this.getTemplate(tenantId, templateId);
    const { id, tenantId: _, ...exportData } = template;
    return exportData;
  }

  async importTemplate(tenantId: string, template: CreateFieldTemplateDto): Promise<FieldTemplateEntity> {
    return this.createTemplate(tenantId, template);
  }

  /**
   * Find template with inheritance support
   */
  async findTemplateWithInheritance(params: {
    templateId?: string;
    moduleType: string;
    tenantId: string;
  }): Promise<FieldTemplateEntity> {
    const { templateId, moduleType, tenantId } = params;

    try {
      // 1. Find specific template if templateId is provided
      if (templateId) {
        const specificTemplate = await this.templateRepo.findOne({
          where: {
            id: templateId,
            status: 'active',
          },
          cache: {
            id: `template_${templateId}`,
            milliseconds: 300000, // 5 minutes
          },
        });

        if (specificTemplate) {
          return this.mergeWithBaseTemplate(specificTemplate);
        }
      }

      // 2. Find tenant default template
      const tenantTemplate = await this.templateRepo.findOne({
        where: {
          moduleType,
          tenantId,
          isDefault: true,
          status: 'active',
        },
        cache: {
          id: `tenant_default_${tenantId}_${moduleType}`,
          milliseconds: 300000,
        },
      });

      if (tenantTemplate) {
        return this.mergeWithBaseTemplate(tenantTemplate);
      }

      // 3. Find system default template
      const systemTemplate = await this.templateRepo.findOne({
        where: {
          moduleType,
          isSystemDefault: true,
          status: 'active',
        },
        cache: {
          id: `system_default_${moduleType}`,
          milliseconds: 300000,
        },
      });

      if (!systemTemplate) {
        throw new Error(`No template found for moduleType: ${moduleType}`);
      }

      return systemTemplate;
    } catch (error) {
      this.logger.error(`Error finding template: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Merge template with its base template
   */
  private async mergeWithBaseTemplate(template: FieldTemplateEntity): Promise<FieldTemplateEntity> {
    if (!template.baseTemplateId) {
      return template;
    }

    try {
      const baseTemplate = await this.templateRepo.findOne({
        where: {
          id: template.baseTemplateId,
          status: 'active',
        },
        cache: {
          id: `template_${template.baseTemplateId}`,
          milliseconds: 300000,
        },
      });

      if (!baseTemplate) {
        this.logger.warn(`Base template ${template.baseTemplateId} not found for template ${template.id}`);
        return template;
      }

      // Recursively merge with base template
      const mergedBaseTemplate = await this.mergeWithBaseTemplate(baseTemplate);

      // Merge fields, giving priority to the specific template
      const mergedFields = this.mergeFields(mergedBaseTemplate.fields, template.fields);

      return {
        ...template,
        fields: mergedFields,
      };
    } catch (error) {
      this.logger.error(`Error merging template ${template.id} with base template: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Merge fields from base and specific templates
   */
  private mergeFields(baseFields: FieldDefinition[], specificFields: FieldDefinition[]): FieldDefinition[] {
    const fieldMap = new Map<string, FieldDefinition>();

    // Add base fields
    baseFields.forEach(field => {
      fieldMap.set(field.name, { ...field });
    });

    // Override with specific fields
    specificFields.forEach(field => {
      fieldMap.set(field.name, { ...field });
    });

    return Array.from(fieldMap.values());
  }
}
