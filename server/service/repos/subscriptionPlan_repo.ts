import { eq, desc, sql, asc } from "drizzle-orm";
import { db } from "server/db";
import { subscriptionPlans } from "server/db/schemas/subscriptionPlans";
import {
  CreateSubscriptionPlanDTO,
  GetSubscriptionPlansOptions,
  GetSubscriptionPlansResponse,
  UpdateSubscriptionPlanDTO,
  SubscriptionPlanResponseDTO,
} from "server/shared/dtos/SubscriptionPlan";
import { PAGINATION_DEFAULTS } from "server/shared/constants/pagination";
import { SUBSCRIPTION_PLAN_SORT_FIELDS } from "server/shared/constants/feature/subscriptionPlanMessages";

export interface IStorageSubscriptionPlan {
  getSubscriptionPlans(
    options?: GetSubscriptionPlansOptions
  ): Promise<GetSubscriptionPlansResponse>;
  getSubscriptionPlan(
    id: string
  ): Promise<SubscriptionPlanResponseDTO | undefined>;
  createSubscriptionPlan(
    plan: CreateSubscriptionPlanDTO & { userIp: string; createdBy: string }
  ): Promise<SubscriptionPlanResponseDTO>;
  updateSubscriptionPlan(
    id: string,
    updates: UpdateSubscriptionPlanDTO & { userIp: string; updatedBy: string }
  ): Promise<SubscriptionPlanResponseDTO>;
  deleteSubscriptionPlan(id: string): Promise<void>;
}

export class StorageSubscriptionPlan implements IStorageSubscriptionPlan {
  async getSubscriptionPlans(
    options?: GetSubscriptionPlansOptions
  ): Promise<GetSubscriptionPlansResponse> {
    const page = options?.page || PAGINATION_DEFAULTS.PAGE;
    const pageSize = options?.pageSize || PAGINATION_DEFAULTS.PAGE_SIZE;
    const search = options?.search?.trim();
    const sortBy =
      options?.sortBy || SUBSCRIPTION_PLAN_SORT_FIELDS.CREATED_ON;
    const sortOrder = options?.sortOrder || PAGINATION_DEFAULTS.SORT_ORDER;

    // Build base query with search filter
    const baseQuery = search
      ? db
          .select()
          .from(subscriptionPlans)
          .where(sql`${subscriptionPlans.name} ILIKE ${"%"+search+"%"}`)
      : db.select().from(subscriptionPlans);

    // Get total count
    const countResult = await baseQuery;
    const total = countResult.length;

    // Apply sorting
    const sortColumn =
      sortBy === SUBSCRIPTION_PLAN_SORT_FIELDS.NAME
        ? subscriptionPlans.name
        : sortBy === SUBSCRIPTION_PLAN_SORT_FIELDS.PRICE
        ? subscriptionPlans.price
        : sortBy === SUBSCRIPTION_PLAN_SORT_FIELDS.DURATION_DAYS
        ? subscriptionPlans.durationDays
        : subscriptionPlans.createdOn;
    const sortFn = sortOrder === "asc" ? asc : desc;

    // Apply pagination
    const offset = (page - 1) * pageSize;
    const items = await baseQuery
      .orderBy(sortFn(sortColumn))
      .limit(pageSize)
      .offset(offset);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async getSubscriptionPlan(
    id: string
  ): Promise<SubscriptionPlanResponseDTO | undefined> {
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async createSubscriptionPlan(
    insertPlan: CreateSubscriptionPlanDTO & {
      userIp: string;
      createdBy: string;
    }
  ): Promise<SubscriptionPlanResponseDTO> {
    const [plan] = await db
      .insert(subscriptionPlans)
      .values({
        name: insertPlan.name,
        price: insertPlan.price,
        durationDays: insertPlan.durationDays,
        createdBy: insertPlan.createdBy,
        userIp: insertPlan.userIp,
      })
      .returning();
    return plan;
  }

  async updateSubscriptionPlan(
    id: string,
    updates: UpdateSubscriptionPlanDTO & {
      userIp: string;
      updatedBy: string;
    }
  ): Promise<SubscriptionPlanResponseDTO> {
    const updatePayload: any = {
      userIp: updates.userIp,
      updatedBy: updates.updatedBy,
    };

    if (updates.name) updatePayload.name = updates.name;
    if (updates.price) updatePayload.price = updates.price;
    if (updates.durationDays) updatePayload.durationDays = updates.durationDays;

    const [plan] = await db
      .update(subscriptionPlans)
      .set(updatePayload)
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return plan;
  }

  async deleteSubscriptionPlan(id: string): Promise<void> {
    await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
  }
}

export const storageSubscriptionPlan = new StorageSubscriptionPlan();
