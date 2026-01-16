import { Column } from "@/components/PaginatedDataTable";
import { SORT_ORDERS } from "@/lib/constants";
import { ListResponse } from "@/lib/interface";
import { Tenant } from "@/models/Tenant";

// Sort types
export type SortField = "name" | "domain" | "createdOn";
export type SortOrder = typeof SORT_ORDERS[keyof typeof SORT_ORDERS];

// Page constants
export const TENANTS_PAGE = {
  TITLE: "Tenants",
  SUBTITLE: "Manage system tenants and organizations.",
  SEARCH_PLACEHOLDER: "Search tenants...",
  NO_TENANTS_MESSAGE: "No tenants found.",
  PAGE_SIZE_LENGTH: 5,
  CURRENT_PAGE: 1,
};

// Button labels
export const BUTTON_LABELS = {
  ADD_TENANT: "Add Tenant",
  CANCEL: "Cancel",
  EDIT: "Edit",
  DELETE: "Delete",
};

// Error messages
export const ERROR_MESSAGES = {
  CREATE_TENANT_FAILED: "Failed to create tenant:",
  UPDATE_TENANT_FAILED: "Failed to update tenant:",
  DELETE_TENANT_FAILED: "Failed to delete tenant:",
};

// Column labels and configuration
export const TENANT_COLUMNS_LABEL = {
  NAME: "Name",
  DOMAIN: "Domain",
  IS_ACTIVE: "Active",
};

// Sortable fields
export const SORTABLE_FIELDS = {
  NAME: "name",
  DOMAIN: "domain",
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

export const COLUMNS: Column<Tenant>[] = [
    {
      key: "name",
      label: TENANT_COLUMNS_LABEL.NAME,
      sortable: true,
    },
    {
      key: "domain",
      label: TENANT_COLUMNS_LABEL.DOMAIN,
      sortable: true,
    },
    {
      key: "isActive",
      label: TENANT_COLUMNS_LABEL.IS_ACTIVE,
      sortable: false,
      render: (value) => (value ? "Yes" : "No"),
    },
];

// Form field labels and validation
export const TENANT_FORM = {
  LABELS: {
    NAME: "Name",
    DOMAIN: "Domain",
    IS_ACTIVE: "Active",
  },
  PLACEHOLDERS: {
    NAME: "Enter tenant name",
    DOMAIN: "Enter domain (optional)",
  },
  VALIDATION: {
    NAME_REQUIRED: "Name is required",
    NAME_MIN_LENGTH: "Name must be at least 2 characters",
    NAME_MAX_LENGTH: "Name must not exceed 100 characters",
    DOMAIN_MIN_LENGTH: "Domain must be at least 3 characters",
    DOMAIN_MAX_LENGTH: "Domain must not exceed 100 characters",
  },
};

export const TOTAL_PAGES = (tenantsData: ListResponse<Tenant>) => tenantsData ? Math.ceil(tenantsData.total / tenantsData.pageSize) : 0;
