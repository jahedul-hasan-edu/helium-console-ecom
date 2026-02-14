import { Column } from "@/components/PaginatedDataTable";
import { SORT_ORDERS } from "@/lib/constants";
import { ListResponse } from "@/lib/interface";
import { Faq } from "@/models/Faq";

// Sort types
export type SortField = "title" | "createdOn";
export type SortOrder = typeof SORT_ORDERS[keyof typeof SORT_ORDERS];

// Page constants
export const FAQS_PAGE = {
  TITLE: "FAQs",
  SUBTITLE: "Manage frequently asked questions.",
  SEARCH_PLACEHOLDER: "Search FAQs...",
  NO_FAQS_MESSAGE: "No FAQs found.",
  PAGE_SIZE_LENGTH: 10,
  CURRENT_PAGE: 1,
  TENANT_FILTER_LABEL: "Filter by Tenant",
  TENANT_FILTER_PLACEHOLDER: "Select a tenant",
};

// Button labels
export const BUTTON_LABELS = {
  ADD_FAQ: "Add FAQ",
  CANCEL: "Cancel",
  EDIT: "Edit",
  DELETE: "Delete",
};

// Error messages
export const ERROR_MESSAGES = {
  CREATE_FAQ_FAILED: "Failed to create FAQ:",
  UPDATE_FAQ_FAILED: "Failed to update FAQ:",
  DELETE_FAQ_FAILED: "Failed to delete FAQ:",
};

// Column labels and configuration
export const FAQ_COLUMNS_LABEL = {
  TITLE: "Title",
  ANSWER: "Answer",
  STATUS: "Status",
};

// Sortable fields
export const SORTABLE_FIELDS = {
  TITLE: "title",
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

export const COLUMNS: Column<Faq>[] = [
  {
    key: "title",
    label: FAQ_COLUMNS_LABEL.TITLE,
    sortable: true,
  },
  {
    key: "answer",
    label: FAQ_COLUMNS_LABEL.ANSWER,
    sortable: false,
  },
  {
    key: "isActive",
    label: FAQ_COLUMNS_LABEL.STATUS,
    sortable: false,
  },
];

// Form validation constants
export const FAQ_FORM = {
  TITLE_LABEL: "Title",
  TITLE_PLACEHOLDER: "Enter FAQ title",
  ANSWER_LABEL: "Answer",
  ANSWER_PLACEHOLDER: "Enter FAQ answer",
  TENANT_LABEL: "Tenant *",
  TENANT_PLACEHOLDER: "Select a tenant",
  ACTIVE_LABEL: "Active",
  ACTIVE_DESCRIPTION: "Mark this FAQ as active",
} as const;

// Helper function
export const TOTAL_PAGES = (response: ListResponse<Faq> | undefined) =>
  response ? Math.ceil(response.total / response.pageSize) : 0;
