import { Column } from "@/components/PaginatedDataTable";
import { SORT_ORDERS } from "@/lib/constants";
import { ListResponse } from "@/lib/interface";
import { MainCategory } from "@/models/MainCategory";

// Sort types
export type SortField = "name" | "slug" | "orderIndex" | "createdOn";
export type SortOrder = typeof SORT_ORDERS[keyof typeof SORT_ORDERS];

// Page constants
export const MAIN_CATEGORIES_PAGE = {
  TITLE: "Main Categories",
  SUBTITLE: "Manage main product categories.",
  SEARCH_PLACEHOLDER: "Search categories...",
  NO_MAIN_CATEGORIES_MESSAGE: "No main categories found.",
  PAGE_SIZE_LENGTH: 5,
  CURRENT_PAGE: 1,
};

// Button labels
export const BUTTON_LABELS = {
  ADD_MAIN_CATEGORY: "Add Main Category",
  CANCEL: "Cancel",
  EDIT: "Edit",
  DELETE: "Delete",
};

// Error messages
export const ERROR_MESSAGES = {
  CREATE_MAIN_CATEGORY_FAILED: "Failed to create main category:",
  UPDATE_MAIN_CATEGORY_FAILED: "Failed to update main category:",
  DELETE_MAIN_CATEGORY_FAILED: "Failed to delete main category:",
};

// Column labels and configuration
export const MAIN_CATEGORY_COLUMNS_LABEL = {
  NAME: "Name",
  SLUG: "Slug",
  ORDER_INDEX: "Order",
};

// Sortable fields
export const SORTABLE_FIELDS = {
  NAME: "name",
  SLUG: "slug",
  ORDER_INDEX: "orderIndex",
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

export const COLUMNS: Column<MainCategory>[] = [
    {
      key: "name",
      label: MAIN_CATEGORY_COLUMNS_LABEL.NAME,
      sortable: true,
    },
    {
      key: "slug",
      label: MAIN_CATEGORY_COLUMNS_LABEL.SLUG,
      sortable: true,
    },
    {
      key: "orderIndex",
      label: MAIN_CATEGORY_COLUMNS_LABEL.ORDER_INDEX,
      sortable: true,
    },
];

// Form field labels and validation
export const MAIN_CATEGORY_FORM = {
  LABELS: {
    NAME: "Name",
    SLUG: "Slug",
    ORDER_INDEX: "Order Index",
  },
  PLACEHOLDERS: {
    NAME: "Enter category name",
    SLUG: "Enter slug",
    ORDER_INDEX: "Enter order index",
  },
  VALIDATION: {
    NAME_REQUIRED: "Name is required",
    NAME_MIN_LENGTH: "Name must be at least 2 characters",
    NAME_MAX_LENGTH: "Name must not exceed 100 characters",
    SLUG_REQUIRED: "Slug is required",
    SLUG_MIN_LENGTH: "Slug must be at least 2 characters",
    SLUG_MAX_LENGTH: "Slug must not exceed 100 characters",
    ORDER_INDEX_REQUIRED: "Order index is required",
    ORDER_INDEX_MIN: "Order index must be 0 or greater",
  },
};

export const TOTAL_PAGES = (mainCategoriesData: ListResponse<MainCategory>) => mainCategoriesData ? Math.ceil(mainCategoriesData.total / mainCategoriesData.pageSize) : 0;
