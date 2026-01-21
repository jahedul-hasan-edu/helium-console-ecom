import { eq, desc, sql, asc, and } from "drizzle-orm";
import { db } from "server/db";
import { tenantSubscriptions } from "server/db/schemas/tenantSubscriptions";
import { tenants } from "server/db/schemas/tenants";
import { subscriptionPlans } from "server/db/schemas/subscriptionPlans";
import {
  CreateTenantSubscriptionDTO,
  GetTenantSubscriptionOptions,
  GetTenantSubscriptionResponse,
  UpdateTenantSubscriptionDTO,
  TenantSubscriptionResponseDTO,
} from "server/shared/dtos/TenantSubscription";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { TENANT_SUBSCRIPTION_SORT_FIELDS } from "server/shared/constants/feature/tenantSubscriptionMessages";

export interface IStorageTenantSubscription {
  getTenantSubscriptions(
    options?: GetTenantSubscriptionOptions
  ): Promise<GetTenantSubscriptionResponse>;
  getTenantSubscription(id: string): Promise<TenantSubscriptionResponseDTO | undefined>;
  createTenantSubscription(
    data: CreateTenantSubscriptionDTO & { userIp: string }
  ): Promise<TenantSubscriptionResponseDTO>;
  updateTenantSubscription(
    id: string,
    updates: UpdateTenantSubscriptionDTO & { userIp: string }
  ): Promise<TenantSubscriptionResponseDTO>;
  deleteTenantSubscription(id: string): Promise<void>;
}

export class StorageTenantSubscription implements IStorageTenantSubscription {
  async getTenantSubscriptions(
    options?: GetTenantSubscriptionOptions
  ): Promise<GetTenantSubscriptionResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy = options?.sortBy || "createdOn";
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    // Build base query with joins (no tenant filtering - show all)
    const baseQuery = db
      .select({
        id: tenantSubscriptions.id,
        tenantId: tenantSubscriptions.tenantId,
        planId: tenantSubscriptions.planId,
        tenantName: tenants.name,
        planName: subscriptionPlans.name,
        startDate: tenantSubscriptions.startDate,
        endDate: tenantSubscriptions.endDate,
        isActive: tenantSubscriptions.isActive,
        createdBy: tenantSubscriptions.createdBy,
        updatedBy: tenantSubscriptions.updatedBy,
        createdOn: tenantSubscriptions.createdOn,
        updatedOn: tenantSubscriptions.updatedOn,
        userIp: tenantSubscriptions.userIp,
      })
      .from(tenantSubscriptions)
      .leftJoin(tenants, eq(tenantSubscriptions.tenantId, tenants.id))
      .leftJoin(subscriptionPlans, eq(tenantSubscriptions.planId, subscriptionPlans.id));

    // Get total count
    const countResult = await baseQuery;
    const total = countResult.length;

    // Apply sorting and pagination
    const sortFn = sortOrder === "asc" ? asc : desc;
    const offset = (page - 1) * pageSize;
    
    let items;
    if (sortBy === "startDate") {
      items = await baseQuery.orderBy(sortFn(tenantSubscriptions.startDate)).limit(pageSize).offset(offset);
    } else if (sortBy === "endDate") {
      items = await baseQuery.orderBy(sortFn(tenantSubscriptions.endDate)).limit(pageSize).offset(offset);
    } else if (sortBy === "isActive") {
      items = await baseQuery.orderBy(sortFn(tenantSubscriptions.isActive)).limit(pageSize).offset(offset);
    } else if (sortBy === "updatedOn") {
      items = await baseQuery.orderBy(sortFn(tenantSubscriptions.updatedOn)).limit(pageSize).offset(offset);
    } else {
      items = await baseQuery.orderBy(sortFn(tenantSubscriptions.createdOn)).limit(pageSize).offset(offset);
    }

    // Transform items to match DTO format
    const transformedItems = items.map((item) => ({
      ...item,
      isActive: item.isActive ?? true,
      createdOn: item.createdOn?.toISOString(),
      updatedOn: item.updatedOn?.toISOString(),
    }));

    return {
      data: transformedItems as TenantSubscriptionResponseDTO[],
      pagination: {
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        totalRecords: total,
      },
    };
  }

  async getTenantSubscription(id: string): Promise<TenantSubscriptionResponseDTO | undefined> {
    const [subscription] = await db
      .select({
        id: tenantSubscriptions.id,
        tenantId: tenantSubscriptions.tenantId,
        planId: tenantSubscriptions.planId,
        tenantName: tenants.name,
        planName: subscriptionPlans.name,
        startDate: tenantSubscriptions.startDate,
        endDate: tenantSubscriptions.endDate,
        isActive: tenantSubscriptions.isActive,
        createdBy: tenantSubscriptions.createdBy,
        updatedBy: tenantSubscriptions.updatedBy,
        createdOn: tenantSubscriptions.createdOn,
        updatedOn: tenantSubscriptions.updatedOn,
        userIp: tenantSubscriptions.userIp,
      })
      .from(tenantSubscriptions)
      .leftJoin(tenants, eq(tenantSubscriptions.tenantId, tenants.id))
      .leftJoin(subscriptionPlans, eq(tenantSubscriptions.planId, subscriptionPlans.id))
      .where(eq(tenantSubscriptions.id, id));
    
    if (!subscription) return undefined;

    return {
      ...subscription,
      isActive: subscription.isActive ?? true,
      createdOn: subscription.createdOn?.toISOString(),
      updatedOn: subscription.updatedOn?.toISOString(),
    } as TenantSubscriptionResponseDTO;
  }

  async createTenantSubscription(
    data: CreateTenantSubscriptionDTO & { userIp: string }
  ): Promise<TenantSubscriptionResponseDTO> {
    const [subscription] = await db
      .insert(tenantSubscriptions)
      .values({
        tenantId: data.tenantId,
        planId: data.planId,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive ?? true,
        userIp: data.userIp,
        createdOn: new Date(),
      })
      .returning();
    
    return {
      ...subscription,
      isActive: subscription.isActive ?? true,
      createdOn: subscription.createdOn?.toISOString(),
      updatedOn: subscription.updatedOn?.toISOString(),
    } as TenantSubscriptionResponseDTO;
  }

  async updateTenantSubscription(
    id: string,
    updates: UpdateTenantSubscriptionDTO & { userIp: string }
  ): Promise<TenantSubscriptionResponseDTO> {
    const updatePayload: any = {
      userIp: updates.userIp,
      updatedOn: new Date(),
    };

    if (updates.tenantId) updatePayload.tenantId = updates.tenantId;
    if (updates.planId) updatePayload.planId = updates.planId;
    if (updates.startDate) updatePayload.startDate = updates.startDate;
    if (updates.endDate) updatePayload.endDate = updates.endDate;
    if (updates.isActive !== undefined) updatePayload.isActive = updates.isActive;

    const [subscription] = await db
      .update(tenantSubscriptions)
      .set(updatePayload)
      .where(eq(tenantSubscriptions.id, id))
      .returning();
    
    return {
      ...subscription,
      isActive: subscription.isActive ?? true,
      createdOn: subscription.createdOn?.toISOString(),
      updatedOn: subscription.updatedOn?.toISOString(),
    } as TenantSubscriptionResponseDTO;
  }

  async deleteTenantSubscription(id: string): Promise<void> {
    await db
      .delete(tenantSubscriptions)
      .where(eq(tenantSubscriptions.id, id));
  }
}

export const storageTenantSubscription = new StorageTenantSubscription();
