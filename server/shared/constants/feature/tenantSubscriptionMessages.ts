export const TENANT_SUBSCRIPTION_MESSAGES = {
  RETRIEVED: "Tenant subscription retrieved successfully",
  LIST_RETRIEVED: "Tenant subscriptions retrieved successfully",
  CREATED: "Tenant subscription created successfully",
  UPDATED: "Tenant subscription updated successfully",
  DELETED: "Tenant subscription deleted successfully",
  NOT_FOUND: "Tenant subscription not found",
  VALIDATION_ERROR: "Validation error",
} as const;

export const TENANT_SUBSCRIPTION_SORT_FIELDS = [
  "startDate",
  "endDate",
  "isActive",
  "createdOn",
  "updatedOn",
] as const;

export type TenantSubscriptionSortField = typeof TENANT_SUBSCRIPTION_SORT_FIELDS[number];
