import { ContextService } from "src/service/context.service";

export class QueryUtils {
    static buildTenantCriteria(contextService: ContextService): Promise<any> {
        return contextService.shouldUseTenantId().then(useTenant => {
            const tenantId = useTenant ? contextService.reqUser.tenantId : null;
            return tenantId ? { id: contextService.reqUser.sub, tenantId } : { id: contextService.reqUser.sub, };
        });
    }
}