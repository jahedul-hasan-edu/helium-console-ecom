import { storageTenant } from "./repos/tenant_repo";
import { CreateTenantDTO, GetTenantsOptions, GetTenantsResponse, UpdateTenantDTO, TenantResponseDTO } from "server/shared/dtos/Tenant";
import { Request } from "express";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { TENANT_SORT_FIELDS } from "server/shared/constants/feature/tenantMessages";

/**
 * Tenant Service
 * Handles all tenant-related business logic
 * Acts as a bridge between controller and repository
 */
export class TenantService {
  /**
   * Get tenants with pagination, sorting, and searching
   */
  async getTenants(req: Request): Promise<GetTenantsResponse> {
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const pageSize = parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as any) || TENANT_SORT_FIELDS.CREATED_ON;
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || PAGINATION_DEFAULTS.SORT_ORDER;
    
    const options: GetTenantsOptions = {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    };

    return await storageTenant.getTenants(options);
  }

  /**
   * Get a single tenant by ID
   */
  async getTenant(id: string): Promise<TenantResponseDTO | undefined> {
    return await storageTenant.getTenant(id);
  }

  /**
   * Check if a domain already exists
   */
  async checkDomainExists(domain: string): Promise<TenantResponseDTO | undefined> {
    return await storageTenant.getTenantByDomain(domain);
  }

  /**
   * Create a new tenant
   */
  async createTenant(req: Request): Promise<TenantResponseDTO> {
    const tenantData: CreateTenantDTO = req.body;
    const userIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";

    return await storageTenant.createTenant({
      ...tenantData,
      userIp,
    });
  }

  /**
   * Update a tenant
   */
  async updateTenant(id: string, updates: UpdateTenantDTO, req: Request): Promise<TenantResponseDTO> {
    const userIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "";

    return await storageTenant.updateTenant(id, {
      ...updates,
      userIp,
    });
  }

  /**
   * Delete a tenant
   */
  async deleteTenant(id: string): Promise<void> {
    return await storageTenant.deleteTenant(id);
  }
}

export const tenantService = new TenantService();
