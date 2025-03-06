import { SetMetadata } from '@nestjs/common';

export const SKIP_TENANT_FILTER = 'skipTenantFilter';

export const SkipTenantFilter = () => SetMetadata(SKIP_TENANT_FILTER, true);

export function TenantEntity() {
  return function (target: any) {
    Reflect.defineMetadata('isTenantEntity', true, target);
  };
}
