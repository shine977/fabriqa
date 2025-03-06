// src/core/dynamic-field/services/field-import-export.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { parse as csvParse } from 'csv-parse';
import { stringify as csvStringify } from 'csv-stringify';
import { FieldDefinitionEntity } from '../entities/field-definition.entity';
import { FieldValueEntity } from '../entities/field-value.entity';
import { FieldContext } from '../interfaces/field.interface';

@Injectable()
export class FieldImportExportService {
  constructor(
    @InjectRepository(FieldDefinitionEntity)
    private fieldDefRepo: Repository<FieldDefinitionEntity>,
    @InjectRepository(FieldValueEntity)
    private fieldValueRepo: Repository<FieldValueEntity>,
  ) {}

  async exportFieldDefinitions(context: FieldContext): Promise<Buffer> {
    const fields = await this.fieldDefRepo.find({
      where: {
        tenantId: context.tenantId,
        moduleId: context.moduleId,
      },
    });

    return new Promise((resolve, reject) => {
      csvStringify(
        fields,
        {
          header: true,
          columns: ['name', 'label', 'type', 'isRequired', 'order', 'metadata'],
        },
        (err, output) => {
          if (err) reject(err);
          resolve(Buffer.from(output));
        },
      );
    });
  }

  async importFieldDefinitions(context: FieldContext, csvBuffer: Buffer): Promise<void> {
    const records = await new Promise<any[]>((resolve, reject) => {
      csvParse(
        csvBuffer,
        {
          columns: true,
          cast: true,
        },
        (err, records) => {
          if (err) reject(err);
          resolve(records);
        },
      );
    });

    for (const record of records) {
      await this.fieldDefRepo.save({
        ...record,
        tenantId: context.tenantId,
        moduleId: context.moduleId,
      });
    }
  }

  async exportFieldValues(context: FieldContext, entityIds: string[]): Promise<Buffer> {
    const values = await this.fieldValueRepo.find({
      where: {
        tenantId: context.tenantId,
        moduleId: context.moduleId,
        entityId: In(entityIds),
      },
    });

    return new Promise((resolve, reject) => {
      csvStringify(
        values,
        {
          header: true,
          columns: ['entityId', 'fieldId', 'value'],
        },
        (err, output) => {
          if (err) reject(err);
          resolve(Buffer.from(output));
        },
      );
    });
  }
}
