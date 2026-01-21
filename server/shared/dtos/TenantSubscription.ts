export interface CreateTenantSubscriptionDTO {
  tenantId: string;
  planId: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdateTenantSubscriptionDTO {
  tenantId?: string;
  planId?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface TenantSubscriptionResponseDTO {
  id: string;
  tenantId: string;
  planId: string;
  tenantName?: string;
  planName?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdOn?: string;
  updatedOn?: string;
  userIp?: string;
}

export interface GetTenantSubscriptionOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface GetTenantSubscriptionResponse {
  data: TenantSubscriptionResponseDTO[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
  };
}
