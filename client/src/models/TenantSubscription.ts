export interface TenantSubscription {
  id: string;
  tenantId: string;
  planId: string;
  tenantName?: string;
  planName?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdOn?: string | null;
  updatedOn?: string | null;
  userIp?: string | null;
}

export interface CreateTenantSubscriptionRequest {
  tenantId: string;
  planId: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdateTenantSubscriptionRequest {
  tenantId?: string;
  planId?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface TenantSubscriptionResponse extends TenantSubscription {}
