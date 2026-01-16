/**
 * SubSubCategory feature messages
 * All sub-sub-category-related success and failure messages
 */
export const SUB_SUB_CATEGORY_MESSAGES = {
  // Success messages
  SUB_SUB_CATEGORIES_RETRIEVED_SUCCESSFULLY: "Sub-sub-categories retrieved successfully",
  SUB_SUB_CATEGORY_RETRIEVED_SUCCESSFULLY: "Sub-sub-category retrieved successfully",
  SUB_SUB_CATEGORY_CREATED_SUCCESSFULLY: "Sub-sub-category created successfully",
  SUB_SUB_CATEGORY_UPDATED_SUCCESSFULLY: "Sub-sub-category updated successfully",
  SUB_SUB_CATEGORY_DELETED_SUCCESSFULLY: "Sub-sub-category deleted successfully",

  // Error messages
  SUB_SUB_CATEGORY_NOT_FOUND: "Sub-sub-category not found",
  SUB_SUB_CATEGORY_ALREADY_EXISTS: "Sub-sub-category already exists",
  INVALID_SUB_SUB_CATEGORY_DATA: "Invalid sub-sub-category data",
  FAILED_TO_CREATE_SUB_SUB_CATEGORY: "Failed to create sub-sub-category",
  FAILED_TO_UPDATE_SUB_SUB_CATEGORY: "Failed to update sub-sub-category",
  FAILED_TO_DELETE_SUB_SUB_CATEGORY: "Failed to delete sub-sub-category",
  SUB_CATEGORY_NOT_FOUND: "Sub category not found",
} as const;

/**
 * SubSubCategory sort fields
 */
export const SUB_SUB_CATEGORY_SORT_FIELDS = {
  NAME: "name",
  SLUG: "slug",
  CREATED_ON: "createdOn",
} as const;

export type SubSubCategorySortField = (typeof SUB_SUB_CATEGORY_SORT_FIELDS)[keyof typeof SUB_SUB_CATEGORY_SORT_FIELDS];
