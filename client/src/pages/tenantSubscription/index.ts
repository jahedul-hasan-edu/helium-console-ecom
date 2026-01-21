import { Column } from "@/components/PaginatedDataTable";
import { SORT_ORDERS } from "@/lib/constants";
import { ListResponse } from "@/lib/interface";
import { TenantSubscription } from "@/models/TenantSubscription";

// Sort types
export type SortField = "startDate" | "endDate" | "isActive" | "createdOn";
export type SortOrder = typeof SORT_ORDERS[keyof typeof SORT_ORDERS];

// Page constants
export const TENANT_SUBSCRIPTIONS_PAGE = {
  TITLE: "Tenant Subscriptions",
  SUBTITLE: "Manage tenant subscription plans and periods.",
  SEARCH_PLACEHOLDER: "Search subscriptions...",
  NO_SUBSCRIPTIONS_MESSAGE: "No tenant subscriptions found.",
  PAGE_SIZE_LENGTH: 5,
  CURRENT_PAGE: 1,
};

// Button labels
export const BUTTON_LABELS = {
  ADD_SUBSCRIPTION: "Add Subscription",
  CANCEL: "Cancel",
  EDIT: "Edit",
  DELETE: "Delete",
  CREATE: "Create Subscription",
  UPDATE: "Update Subscription",
  CONFIRM_DELETE: "Delete",
};

// Error messages
export const ERROR_MESSAGES = {
  CREATE_SUBSCRIPTION_FAILED: "Failed to create subscription:",
  UPDATE_SUBSCRIPTION_FAILED: "Failed to update subscription:",
  DELETE_SUBSCRIPTION_FAILED: "Failed to delete subscription:",
  LOAD_TENANTS_FAILED: "Failed to load tenants:",
  LOAD_PLANS_FAILED: "Failed to load subscription plans:",
};

// Column labels and configuration
export const SUBSCRIPTION_COLUMNS_LABEL = {
  TENANT: "Tenant",
  PLAN: "Plan",
  START_DATE: "Start Date",
  END_DATE: "End Date",
  IS_ACTIVE: "Active",
};

// Sortable fields
export const SORTABLE_FIELDS = {
  START_DATE: "startDate",
  END_DATE: "endDate",
  IS_ACTIVE: "isActive",
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

export const BASE_COLUMNS: Column<TenantSubscription>[] = [
  {
    key: "tenantName",
    label: SUBSCRIPTION_COLUMNS_LABEL.TENANT,
  },
  {
    key: "planName",
    label: SUBSCRIPTION_COLUMNS_LABEL.PLAN,
  },
  {
    key: "startDate",
    label: SUBSCRIPTION_COLUMNS_LABEL.START_DATE,
    sortable: true,
  },
  {
    key: "endDate",
    label: SUBSCRIPTION_COLUMNS_LABEL.END_DATE,
    sortable: true,
  },
  {
    key: "isActive",
    label: SUBSCRIPTION_COLUMNS_LABEL.IS_ACTIVE,
    sortable: true,
  },
];

export const TOTAL_PAGES = (data: ListResponse<TenantSubscription>) =>
  data ? Math.ceil(data.total / data.pageSize) : 0;

// Form field labels and messages
export const TENANT_SUBSCRIPTION_FORM = {
  LABELS: {
    TENANT: "Tenant",
    PLAN: "Subscription Plan",
    START_DATE: "Start Date",
    END_DATE: "End Date",
    IS_ACTIVE: "Active Status",
  },
  PLACEHOLDERS: {
    TENANT: "Select a tenant",
    PLAN: "Select a subscription plan",
    START_DATE: "Select start date",
    END_DATE: "Select end date",
  },
  VALIDATION: {
    TENANT_REQUIRED: "Tenant is required",
    PLAN_REQUIRED: "Subscription plan is required",
    START_DATE_REQUIRED: "Start date is required",
    END_DATE_REQUIRED: "End date is required",
    END_DATE_AFTER_START: "End date must be after start date",
  },
  MODALS: {
    CREATE_TITLE: "Create Tenant Subscription",
    EDIT_TITLE: "Edit Tenant Subscription",
    DELETE_TITLE: "Delete Tenant Subscription",
    DELETE_MESSAGE: "Are you sure you want to delete this subscription?",
  },
};
