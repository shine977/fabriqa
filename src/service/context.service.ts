import { Inject, Injectable } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { RequestUser } from "src/types/user.interface";

interface TenantCriteria {
    id: number,
    tenantId: string
}

@Injectable()
export class ContextService {
    constructor(@Inject(REQUEST) private request: Request) { }
    get reqUser() {
        return this.request.user as RequestUser
    }
    shouldUseTenantId() {
        return new Promise(resolve => resolve((this.request.user as RequestUser).tenantId))
    }
    // buildTenantCriteria(id: number): Promise<TenantCriteria>;
    buildTenantCriteria(id?: number): Promise<Pick<TenantCriteria, 'tenantId'>>
    buildTenantCriteria(id?: number): Promise<Pick<TenantCriteria, 'tenantId'> | TenantCriteria | {}> {
        return this.shouldUseTenantId().then((tenant: string) => {
            return id ? { tenantId: tenant, id } : { tenantId: tenant }
        })
    }
}