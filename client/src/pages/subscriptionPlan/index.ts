import { Column } from "@/components/PaginatedDataTable";
import { SORT_ORDERS } from "@/lib/constants";
import { ListResponse } from "@/lib/interface";
import { SubscriptionPlan } from "@/models/SubscriptionPlan";

// Sort types
export type SortField = "name" | "price" | "durationDays" | "createdOn";
export type SortOrder = typeof SORT_ORDERS[keyof typeof SORT_ORDERS];

// Page constants
export const SUBSCRIPTION_PLAN_PAGE = {
  TITLE: "Subscription Plans",
  SUBTITLE: "Manage subscription plans and pricing.",
  SEARCH_PLACEHOLDER: "Search plans...",
  NO_PLANS_MESSAGE: "No subscription plans found.",
  PAGE_SIZE_LENGTH: 5,
  CURRENT_PAGE: 1,
};

// Button labels
export const BUTTON_LABELS = {
  ADD_PLAN: "Add Plan",
  CANCEL: "Cancel",
  EDIT: "Edit",
  DELETE: "Delete",
};

// Error messages
export const ERROR_MESSAGES = {
  CREATE_PLAN_FAILED: "Failed to create subscription plan:",
  UPDATE_PLAN_FAILED: "Failed to update subscription plan:",
  DELETE_PLAN_FAILED: "Failed to delete subscription plan:",
};

// Column labels and configuration
export const SUBSCRIPTION_PLAN_COLUMNS_LABEL = {
  NAME: "Name",
  PRICE: "Price",
  DURATION_DAYS: "Duration (Days)",
};

// Sortable fields
export const SORTABLE_FIELDS = {
  NAME: "name",
  PRICE: "price",
  DURATION_DAYS: "durationDays",
  CREATED_ON: "createdOn",
} as const;

// Sort configuration
export const SORT_CONFIG = {
  ORDERS: {
    ASC: SORT_ORDERS.ASC as SortOrder,
    DESC: SORT_ORDERS.DESC as SortOrder,
  },
} as const;

// Action button configuration
export const ACTION_BUTTONS = {
  SHOW_LABEL: false,
  SIZE: "sm" as const,
  VARIANT: "ghost" as const,
};

export const COLUMNS: Column<SubscriptionPlan>[] = [
  {
    key: "name",
    label: SUBSCRIPTION_PLAN_COLUMNS_LABEL.NAME,
    sortable: true,
  },
  {
    key: "price",
    label: SUBSCRIPTION_PLAN_COLUMNS_LABEL.PRICE,
    sortable: true,
  },
  {
    key: "durationDays",
    label: SUBSCRIPTION_PLAN_COLUMNS_LABEL.DURATION_DAYS,
    sortable: true,
  },
];

export const TOTAL_PAGES = (plansData: ListResponse<SubscriptionPlan>) =>
  plansData ? Math.ceil(plansData.total / plansData.pageSize) : 0;

// Form field labels
export const SUBSCRIPTION_PLAN_FORM = {
  NAME_LABEL: "Plan Name",
  NAME_PLACEHOLDER: "Enter plan name",
  PRICE_LABEL: "Price",
  PRICE_PLACEHOLDER: "Enter price",
  DURATION_DAYS_LABEL: "Duration (Days)",
  DURATION_DAYS_PLACEHOLDER: "Enter duration in days",
  VALIDATION: {
    NAME_REQUIRED: "Plan name is required",
    PRICE_REQUIRED: "Price is required",
    DURATION_DAYS_REQUIRED: "Duration days is required",
  },
};
