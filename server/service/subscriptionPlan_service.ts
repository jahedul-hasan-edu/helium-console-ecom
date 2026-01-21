import { storageSubscriptionPlan } from "./repos/subscriptionPlan_repo";
import {
  CreateSubscriptionPlanDTO,
  GetSubscriptionPlansOptions,
  GetSubscriptionPlansResponse,
  UpdateSubscriptionPlanDTO,
  SubscriptionPlanResponseDTO,
} from "server/shared/dtos/SubscriptionPlan";
import { Request } from "express";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { SUBSCRIPTION_PLAN_SORT_FIELDS } from "server/shared/constants/feature/subscriptionPlanMessages";

/**
 * Subscription Plan Service
 * Handles all subscription plan-related business logic
 * Acts as a bridge between controller and repository
 */
export class SubscriptionPlanService {
  /**
   * Get subscription plans with pagination, sorting, and searching
   */
  async getSubscriptionPlans(
    req: Request
  ): Promise<GetSubscriptionPlansResponse> {
    const page =
      parseInt(req.query.page as string) || PAGINATION_DEFAULTS.PAGE;
    const pageSize =
      parseInt(req.query.pageSize as string) || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = req.query.search as string | undefined;
    const sortBy =
      (req.query.sortBy as any) || SUBSCRIPTION_PLAN_SORT_FIELDS.CREATED_ON;
    const sortOrder =
      (req.query.sortOrder as "asc" | "desc") || PAGINATION_DEFAULTS.SORT_ORDER;

    const options: GetSubscriptionPlansOptions = {
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    };

    return await storageSubscriptionPlan.getSubscriptionPlans(options);
  }

  /**
   * Get a single subscription plan by ID
   */
  async getSubscriptionPlan(
    id: string
  ): Promise<SubscriptionPlanResponseDTO | undefined> {
    return await storageSubscriptionPlan.getSubscriptionPlan(id);
  }

  /**
   * Create a new subscription plan
   */
  async createSubscriptionPlan(
    req: Request
  ): Promise<SubscriptionPlanResponseDTO> {
    const plan: CreateSubscriptionPlanDTO = req.body;

    // Extract user IP from request
    const userIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    // For now, using a placeholder for createdBy
    const createdBy = "00000000-0000-0000-0000-000000000000";

    return await storageSubscriptionPlan.createSubscriptionPlan({
      ...plan,
      createdBy,
      userIp,
    });
  }

  /**
   * Update an existing subscription plan
   */
  async updateSubscriptionPlan(
    id: string,
    updates: UpdateSubscriptionPlanDTO,
    req: Request
  ): Promise<SubscriptionPlanResponseDTO> {
    // Extract user IP from request
    const userIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";

    // For now, using a placeholder for updatedBy
    const updatedBy = "00000000-0000-0000-0000-000000000000";

    return await storageSubscriptionPlan.updateSubscriptionPlan(id, {
      ...updates,
      updatedBy,
      userIp,
    });
  }

  /**
   * Delete a subscription plan
   */
  async deleteSubscriptionPlan(id: string): Promise<void> {
    return await storageSubscriptionPlan.deleteSubscriptionPlan(id);
  }
}

export const subscriptionPlanService = new SubscriptionPlanService();
