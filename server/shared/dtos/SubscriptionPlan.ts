import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { subscriptionPlans } from "../../db/schemas/subscriptionPlans";
import { PaginationOptions, PaginationResponse } from "../utils/pagination";
import {
  SUBSCRIPTION_PLAN_SORT_FIELDS,
  SubscriptionPlanSortField,
} from "../constants/feature/subscriptionPlanMessages";

// === BASE SCHEMA ===
export const subscriptionPlanSchema = createInsertSchema(subscriptionPlans);

// === CREATE SUBSCRIPTION PLAN DTO ===
export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  durationDays: z.coerce
    .number()
    .int("Duration days must be an integer")
    .positive("Duration days must be positive"),
}).strict();

export type CreateSubscriptionPlanDTO = z.infer<
  typeof createSubscriptionPlanSchema
>;

// === UPDATE SUBSCRIPTION PLAN DTO ===
export const updateSubscriptionPlanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  durationDays: z.coerce
    .number()
    .int("Duration days must be an integer")
    .positive("Duration days must be positive"),
}).strict();

export type UpdateSubscriptionPlanDTO = z.infer<
  typeof updateSubscriptionPlanSchema
>;

// === SUBSCRIPTION PLAN RESPONSE DTO ===
export const subscriptionPlanResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.string(),
  durationDays: z.number(),
  createdBy: z.string().uuid().nullable(),
  updatedBy: z.string().uuid().nullable(),
  createdOn: z.date().nullable(),
  updatedOn: z.date().nullable(),
  userIp: z.string().nullable(),
});

export interface SubscriptionPlanResponseDTO {
  id: string;
  name: string | null;
  price: string | null;
  durationDays: number | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: Date | null;
  updatedOn: Date | null;
  userIp: string | null;
}

// === GET SUBSCRIPTION PLANS OPTIONS ===
export interface GetSubscriptionPlansOptions extends PaginationOptions {
  search?: string;
  sortBy?: SubscriptionPlanSortField;
  sortOrder?: "asc" | "desc";
}

// === GET SUBSCRIPTION PLANS RESPONSE ===
export interface GetSubscriptionPlansResponse
  extends PaginationResponse<SubscriptionPlanResponseDTO> {}
