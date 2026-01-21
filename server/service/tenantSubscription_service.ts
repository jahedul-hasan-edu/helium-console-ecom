import { storageTenantSubscription } from "./repos/tenantSubscription_repo";
import {
  CreateTenantSubscriptionDTO,
  GetTenantSubscriptionOptions,
  GetTenantSubscriptionResponse,
  UpdateTenantSubscriptionDTO,
  TenantSubscriptionResponseDTO,
} from "server/shared/dtos/TenantSubscription";
import { Request } from "express";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { TENANT_SUBSCRIPTION_SORT_FIELDS } from "server/shared/constants/feature/tenantSubscriptionMessages";

const DEFAULT_TENANT_ID = "0027d5b0-9a89-48f0-95fd-2228294ff053";

/**
 * Tenant Subscription Service
 * Handles all tenant subscription-related business logic
 * Acts as a bridge between controller and repository
 */
export class TenantSubscriptionService {
  /**
   * Get tenant subscriptions with pagination, sorting, and searching
   */
  async getTenantSubscriptions(req: Request): Promise<GetTenantSubscriptionResponse> {
    const page = parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const pageSize = parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = req.query.search as string | undefined;
    const sortBy = (req.query.sortBy as any) || "createdOn";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || PAGINATION_DEFAULTS.SORT_ORDER;

    const options: GetTenantSubscriptionOptions = {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    };

    return await storageTenantSubscription.getTenantSubscriptions(options);
  }

  /**
   * Get a single tenant subscription by ID
   */
  async getTenantSubscription(id: string): Promise<TenantSubscriptionResponseDTO | undefined> {
    return await storageTenantSubscription.getTenantSubscription(id);
  }

  /**
   * Create a new tenant subscription
   */
  async createTenantSubscription(req: Request): Promise<TenantSubscriptionResponseDTO> {
    const subscription: CreateTenantSubscriptionDTO = req.body;

    // Extract user IP from request
    const userIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    return await storageTenantSubscription.createTenantSubscription({
      ...subscription,
      userIp,
    });
  }

  /**
   * Update an existing tenant subscription
   */
  async updateTenantSubscription(
    id: string,
    updates: UpdateTenantSubscriptionDTO,
    req: Request
  ): Promise<TenantSubscriptionResponseDTO> {
    // Extract user IP from request
    const userIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    return await storageTenantSubscription.updateTenantSubscription(id, {
      ...updates,
      userIp,
    });
  }

  /**
   * Delete a tenant subscription
   */
  async deleteTenantSubscription(id: string): Promise<void> {
    await storageTenantSubscription.deleteTenantSubscription(id);
  }
}

export const tenantSubscriptionService = new TenantSubscriptionService();
