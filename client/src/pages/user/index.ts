import { Column } from "@/components/PaginatedDataTable";
import { SORT_ORDERS } from "@/lib/constants";
import { ListResponse } from "@/lib/interface";
import { User } from "@/models/User";

// Sort types
export type SortField = "firstName" | "lastName" | "email" | "createdOn";
export type SortOrder = typeof SORT_ORDERS[keyof typeof SORT_ORDERS];

// Page constants
export const USERS_PAGE = {
  TITLE: "Users",
  SUBTITLE: "Manage system users and permissions.",
  SEARCH_PLACEHOLDER: "Search users...",
  NO_USERS_MESSAGE: "No users found.",
  PAGE_SIZE_LENGTH: 5,
  CURRENT_PAGE: 1,
};

// Button labels
export const BUTTON_LABELS = {
  ADD_USER: "Add User",
  CANCEL: "Cancel",
  EDIT: "Edit",
  DELETE: "Delete",
};

// Error messages
export const ERROR_MESSAGES = {
  CREATE_USER_FAILED: "Failed to create user:",
  UPDATE_USER_FAILED: "Failed to update user:",
  DELETE_USER_FAILED: "Failed to delete user:",
};

// Column labels and configuration
export const USER_COLUMNS_LABEL = {
  FIRST_NAME: "First Name",
  LAST_NAME: "Last Name",
  EMAIL: "Email",
  MOBILE: "Mobile",
};

// Sortable fields
export const SORTABLE_FIELDS = {
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName",
  EMAIL: "email",
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

export const COLUMNS: Column<User>[] = [
    {
      key: "firstName",
      label: USER_COLUMNS_LABEL.FIRST_NAME,
      sortable: true,
    },
    {
      key: "lastName",
      label: USER_COLUMNS_LABEL.LAST_NAME,
      sortable: true,
    },
    {
      key: "email",
      label: USER_COLUMNS_LABEL.EMAIL,
      sortable: true,
    },
    {
      key: "mobile",
      label: USER_COLUMNS_LABEL.MOBILE,
    },
  ];

export const TOTAL_PAGES = (usersData: ListResponse<User>) => usersData ? Math.ceil(usersData.total / usersData.pageSize) : 0;