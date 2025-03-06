// src/core/dynamic-field/services/field-audit.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldAuditLogEntity } from '../entities/field-audit-log.entity';
import { FieldContext } from '../interfaces/field.interface';

@Injectable()
export class FieldAuditService {
  constructor(
    @InjectRepository(FieldAuditLogEntity)
    private auditLogRepo: Repository<FieldAuditLogEntity>,
  ) {}

  async logFieldChange(
    context: FieldContext,
    entityId: string,
    fieldId: string,
    action: 'create' | 'update' | 'delete',
    oldValue: any,
    newValue: any,
    userId: string,
  ): Promise<void> {
    await this.auditLogRepo.save({
      tenantId: context.tenantId,
      moduleId: context.moduleId,
      entityId,
      fieldId,
      action,
      oldValue,
      newValue,
      userId,
    });
  }

  async getFieldHistory(context: FieldContext, entityId: string, fieldId?: string): Promise<FieldAuditLogEntity[]> {
    const query = this.auditLogRepo
      .createQueryBuilder('log')
      .where('log.tenantId = :tenantId', { tenantId: context.tenantId })
      .andWhere('log.moduleId = :moduleId', { moduleId: context.moduleId })
      .andWhere('log.entityId = :entityId', { entityId });

    if (fieldId) {
      query.andWhere('log.fieldId = :fieldId', { fieldId });
    }

    return query.orderBy('log.createdAt', 'DESC').getMany();
  }
}
