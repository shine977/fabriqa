// src/core/dynamic-field/services/field-version.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldDefinitionEntity } from '../entities/field-definition.entity';
import { FieldContext } from '../interfaces/field.interface';

@Injectable()
export class FieldVersionService {
  constructor(
    @InjectRepository(FieldDefinitionEntity)
    private fieldDefRepo: Repository<FieldDefinitionEntity>,
  ) {}

  /**
   * Create a new version of a field
   */
  async createVersion(
    context: FieldContext,
    fieldId: string,
    changes: Partial<FieldDefinitionEntity>,
  ): Promise<FieldDefinitionEntity> {
    const currentField = await this.fieldDefRepo.findOne({
      where: { id: fieldId },
    });

    if (!currentField) {
      throw new Error('Field not found');
    }

    // Create new version
    const newVersion = this.fieldDefRepo.create({
      ...currentField,
      ...changes,
      id: undefined, // Let the database generate a new ID
      version: (currentField.version || 0) + 1,
      previousVersionId: currentField.id,
      tenantId: context.tenantId,
    });

    return this.fieldDefRepo.save(newVersion);
  }

  /**
   * Get field version history
   */
  async getVersionHistory(context: FieldContext, fieldId: string): Promise<FieldDefinitionEntity[]> {
    return this.fieldDefRepo.find({
      where: [
        { id: fieldId, tenantId: context.tenantId },
        { previousVersionId: fieldId, tenantId: context.tenantId },
      ],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Revert to a specific version
   */
  async revertToVersion(context: FieldContext, fieldId: string, version: number): Promise<FieldDefinitionEntity> {
    const targetVersion = await this.fieldDefRepo.findOne({
      where: {
        previousVersionId: fieldId,
        version,
        tenantId: context.tenantId,
      },
    });

    if (!targetVersion) {
      throw new Error('Version not found');
    }

    const { version: _, previousVersionId: __, ...versionData } = targetVersion;

    return this.createVersion(context, fieldId, versionData);
  }
}
