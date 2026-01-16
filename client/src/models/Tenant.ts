export interface Tenant {
  id: string;
  name: string;
  domain: string | null;
  isActive: boolean | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: Date | null;
  updatedOn: Date | null;
  userIp: string | null;
}

export interface CreateTenantRequest {
  name: string;
  domain?: string;
  isActive?: boolean;
}

export interface UpdateTenantRequest {
  name?: string;
  domain?: string;
  isActive?: boolean;
}

export interface TenantResponse extends Tenant {}

export type TenantListResponse = Tenant[];
