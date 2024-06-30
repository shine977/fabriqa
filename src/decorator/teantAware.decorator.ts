import { QueryUtils } from "src/common/utils/queryUtils"
import { ContextService } from "src/service/context.service"

export function TenantAware() {
    return function (target: any, propertyKey: any, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value
        descriptor.value = async function (...args: any) {
            console.log('args~~~', args)
            const criteria = await QueryUtils.buildTenantCriteria(this.context as ContextService)
            if (criteria) {
                args[0] = { ...args[0], ...criteria }
            } else {
                args[0] = { ...args[0], id: (this.context as ContextService).reqUser.sub }
            }
            return originalMethod.apply(this, args)
        }
        return descriptor
    }

}