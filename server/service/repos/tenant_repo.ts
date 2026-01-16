import { eq, desc, sql, asc } from "drizzle-orm";
import { db } from "server/db";
import { tenants } from "server/db/schemas/tenants";
import { CreateTenantDTO, GetTenantsOptions, GetTenantsResponse, UpdateTenantDTO, TenantResponseDTO } from "server/shared/dtos/Tenant";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { TENANT_SORT_FIELDS } from "server/shared/constants/feature/tenantMessages";

export interface IStorageTenant {
  // Tenants
  getTenants(options?: GetTenantsOptions): Promise<GetTenantsResponse>;
  getTenant(id: string): Promise<TenantResponseDTO | undefined>;
  getTenantByDomain(domain: string): Promise<TenantResponseDTO | undefined>;
  createTenant(tenant: CreateTenantDTO & { userIp: string }): Promise<TenantResponseDTO>;
  updateTenant(id: string, updates: UpdateTenantDTO & { userIp: string }): Promise<TenantResponseDTO>;
  deleteTenant(id: string): Promise<void>;
}

export class StorageTenant implements IStorageTenant {
  // Tenants
  async getTenants(options?: GetTenantsOptions): Promise<GetTenantsResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy || TENANT_SORT_FIELDS.CREATED_ON;
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    // Build base query with search filter
    const baseQuery = search
      ? db.select().from(tenants).where(
          sql`${tenants.name} ILIKE ${"%"+search+"%"} OR ${tenants.domain} ILIKE ${"%"+search+"%"}`
        )
      : db.select().from(tenants);

    // Get total count
    const countResult = await baseQuery;
    const total = countResult.length;

    // Apply sorting
    const sortColumn = sortBy === TENANT_SORT_FIELDS.NAME ? tenants.name : sortBy === TENANT_SORT_FIELDS.DOMAIN ? tenants.domain : tenants.createdOn;
    const sortFn = sortOrder === "asc" ? asc : desc;

    // Apply pagination
    const offset = (page - 1) * pageSize;
    const items = await baseQuery.orderBy(sortFn(sortColumn)).limit(pageSize).offset(offset);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async getTenant(id: string): Promise<TenantResponseDTO | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getTenantByDomain(domain: string): Promise<TenantResponseDTO | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.domain, domain));
    return tenant;
  }

  async createTenant(insertTenant: CreateTenantDTO & { userIp: string }): Promise<TenantResponseDTO> {
    const [tenant] = await db.insert(tenants).values({
      name: insertTenant.name,
      domain: insertTenant.domain,
      isActive: insertTenant.isActive ?? true,
      userIp: insertTenant.userIp,
      createdOn: new Date(),
      updatedOn: new Date(),
    }).returning();

    return tenant;
  }

  async updateTenant(id: string, updates: UpdateTenantDTO & { userIp: string }): Promise<TenantResponseDTO> {
    const [tenant] = await db.update(tenants)
      .set({
        ...updates,
        updatedOn: new Date(),
      })
      .where(eq(tenants.id, id))
      .returning();

    return tenant;
  }

  async deleteTenant(id: string): Promise<void> {
    await db.delete(tenants).where(eq(tenants.id, id));
  }
}

export const storageTenant = new StorageTenant();
