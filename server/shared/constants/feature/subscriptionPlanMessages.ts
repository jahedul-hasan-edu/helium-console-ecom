/**
 * Subscription Plan feature messages
 * All subscription plan-related success and failure messages
 */
export const SUBSCRIPTION_PLAN_MESSAGES = {
  // Success messages
  SUBSCRIPTION_PLANS_RETRIEVED_SUCCESSFULLY:
    "Subscription plans retrieved successfully",
  SUBSCRIPTION_PLAN_RETRIEVED_SUCCESSFULLY:
    "Subscription plan retrieved successfully",
  SUBSCRIPTION_PLAN_CREATED_SUCCESSFULLY: "Subscription plan created successfully",
  SUBSCRIPTION_PLAN_UPDATED_SUCCESSFULLY: "Subscription plan updated successfully",
  SUBSCRIPTION_PLAN_DELETED_SUCCESSFULLY: "Subscription plan deleted successfully",

  // Error messages
  SUBSCRIPTION_PLAN_NOT_FOUND: "Subscription plan not found",
  SUBSCRIPTION_PLAN_ALREADY_EXISTS: "Subscription plan already exists",
  INVALID_SUBSCRIPTION_PLAN_DATA: "Invalid subscription plan data",
  FAILED_TO_CREATE_SUBSCRIPTION_PLAN: "Failed to create subscription plan",
  FAILED_TO_UPDATE_SUBSCRIPTION_PLAN: "Failed to update subscription plan",
  FAILED_TO_DELETE_SUBSCRIPTION_PLAN: "Failed to delete subscription plan",
} as const;

/**
 * Subscription Plan sort fields
 */
export const SUBSCRIPTION_PLAN_SORT_FIELDS = {
  NAME: "name",
  PRICE: "price",
  DURATION_DAYS: "durationDays",
  CREATED_ON: "createdOn",
} as const;

export type SubscriptionPlanSortField =
  (typeof SUBSCRIPTION_PLAN_SORT_FIELDS)[keyof typeof SUBSCRIPTION_PLAN_SORT_FIELDS];
