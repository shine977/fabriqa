export interface RequestUser {
  username: string;
  sub: string;
  tenantId: string;
  isSuperAdmin: boolean;
  permissions: string[];
  id: string;
}
