import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { RequestUser } from 'src/types/user.interface';
import { AuditableEntity, AuditLogEntity } from '../entities';

@Injectable({ scope: Scope.REQUEST })
export class GlobalEntitySubscriber implements EntitySubscriberInterface {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(AuditLogEntity)
    private auditLogRepo: Repository<AuditLogEntity>,
  ) {
    dataSource.subscribers.push(this);
  }

  beforeInsert(event: InsertEvent<any>) {
    if (event.entity instanceof AuditableEntity) {
      const user = this.request.user as RequestUser;
      if (user) {
        event.entity.createdBy = user.sub;
        event.entity.updatedBy = user.sub;
        event.entity.tenantId = user.tenantId;
        event.entity.ipAddress = this.request.ip;
        event.entity.userAgent = this.request.headers['user-agent'];
      }
    }
  }

  beforeUpdate(event: UpdateEvent<any>) {
    if (event.entity instanceof AuditableEntity) {
      const user = this.request.user as RequestUser;
      if (user) {
        event.entity.updatedBy = user.sub;
      }
    }
  }

  afterInsert(event: InsertEvent<any>) {
    this.createAuditLog('CREATE', event.entity);
  }

  afterUpdate(event: UpdateEvent<any>) {
    this.createAuditLog('UPDATE', event.entity, event.databaseEntity);
  }

  beforeRemove(event: RemoveEvent<any>) {
    this.createAuditLog('DELETE', event.entity);
  }

  private async createAuditLog(action: 'CREATE' | 'UPDATE' | 'DELETE', newData: any, oldData?: any) {
    const user = this.request.user as RequestUser;
    if (!user) return;

    await this.auditLogRepo.save({
      entityName: newData.constructor.name,
      entityId: newData.id,
      action,
      oldValue: oldData ? JSON.stringify(oldData) : null,
      newValue: JSON.stringify(newData),
      userId: user.sub,
      tenantId: user.tenantId,
      ipAddress: this.request.ip,
      userAgent: this.request.headers['user-agent'],
    });
  }
}
