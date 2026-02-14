/**
 * Home Setting page constants
 */

// Page configuration
export const HOME_SETTING_PAGE = {
  TITLE: "Home Settings",
  SUBTITLE: "Manage your home page settings and images",
  SEARCH_PLACEHOLDER: "Search by title or subtitle...",
  TENANT_FILTER_PLACEHOLDER: "Filter by tenant",
  EMPTY_STATE: "No home settings found",
} as const;

// Button labels
export const BUTTON_LABELS = {
  ADD_HOME_SETTING: "Add Home Setting",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  CREATE_HOME_SETTING_FAILED: "Failed to create home setting",
  UPDATE_HOME_SETTING_FAILED: "Failed to update home setting",
  DELETE_HOME_SETTING_FAILED: "Failed to delete home setting",
} as const;

// Action buttons
export const ACTION_BUTTONS = {
  EDIT: "Edit",
  DELETE: "Delete",
} as const;

// Column configuration
export const COLUMNS = [
  {
    key: "title" as const,
    label: "Title",
    sortable: true,
  },
  {
    key: "subTitle" as const,
    label: "Subtitle",
    sortable: false,
  },
  {
    key: "isActive" as const,
    label: "Status",
    sortable: false,
  },
  {
    key: "createdOn" as const,
    label: "Created",
    sortable: false,
  },
] as const;

// Sortable fields
export const SORTABLE_FIELDS = {
  TITLE: "title",
  CREATED_ON: "createdOn",
} as const;

export type SortField = (typeof SORTABLE_FIELDS)[keyof typeof SORTABLE_FIELDS];
export type SortOrder = "asc" | "desc";

// Sort configuration
export const SORT_CONFIG = {
  ORDERS: {
    ASC: "asc" as const,
    DESC: "desc" as const,
  },
} as const;

// Pagination
export const HOME_SETTING_PAGE_SIZE = {
  CURRENT_PAGE: 1,
  PAGE_SIZE_LENGTH: 10,
} as const;

export const TOTAL_PAGES = (data: any) => {
  return data?.total ? Math.ceil(data.total / 10) : 0;
};

// Form labels and placeholders
export const HOME_SETTING_FORM = {
  TENANT_LABEL: "Tenant *",
  TENANT_PLACEHOLDER: "Select a tenant",
  TITLE_LABEL: "Title *",
  TITLE_PLACEHOLDER: "Enter home setting title",
  SUBTITLE_LABEL: "Subtitle *",
  SUBTITLE_PLACEHOLDER: "Enter home setting subtitle",
  ACTIVE_LABEL: "Active",
  IMAGES_LABEL: "Images",
  IMAGES_PLACEHOLDER: "Upload images",
  VALIDATION: {
    TITLE_REQUIRED: "Title is required",
    TITLE_MIN_LENGTH: "Title must be at least 1 character",
    SUBTITLE_REQUIRED: "Subtitle is required",
    SUBTITLE_MIN_LENGTH: "Subtitle must be at least 1 character",
    TENANT_REQUIRED: "Tenant is required",
    INVALID_IMAGE_SIZE: "Image size must not exceed 1MB",
  },
} as const;
