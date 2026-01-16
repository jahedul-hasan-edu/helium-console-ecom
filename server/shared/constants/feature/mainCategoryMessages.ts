/**
 * Main Category feature messages
 * All main category-related success and failure messages
 */
export const MAIN_CATEGORY_MESSAGES = {
  // Success messages
  MAIN_CATEGORIES_RETRIEVED_SUCCESSFULLY: "Main categories retrieved successfully",
  MAIN_CATEGORY_RETRIEVED_SUCCESSFULLY: "Main category retrieved successfully",
  MAIN_CATEGORY_CREATED_SUCCESSFULLY: "Main category created successfully",
  MAIN_CATEGORY_UPDATED_SUCCESSFULLY: "Main category updated successfully",
  MAIN_CATEGORY_DELETED_SUCCESSFULLY: "Main category deleted successfully",

  // Error messages
  MAIN_CATEGORY_NOT_FOUND: "Main category not found",
  MAIN_CATEGORY_ALREADY_EXISTS: "Main category already exists",
  INVALID_MAIN_CATEGORY_DATA: "Invalid main category data",
  FAILED_TO_CREATE_MAIN_CATEGORY: "Failed to create main category",
  FAILED_TO_UPDATE_MAIN_CATEGORY: "Failed to update main category",
  FAILED_TO_DELETE_MAIN_CATEGORY: "Failed to delete main category",
} as const;

/**
 * Main Category sort fields
 */
export const MAIN_CATEGORY_SORT_FIELDS = {
  NAME: "name",
  SLUG: "slug",
  ORDER_INDEX: "orderIndex",
  CREATED_ON: "createdOn",
} as const;

export type MainCategorySortField = (typeof MAIN_CATEGORY_SORT_FIELDS)[keyof typeof MAIN_CATEGORY_SORT_FIELDS];
