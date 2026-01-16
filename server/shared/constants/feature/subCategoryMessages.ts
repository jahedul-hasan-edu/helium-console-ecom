/**
 * SubCategory feature messages
 * All sub-category-related success and failure messages
 */
export const SUB_CATEGORY_MESSAGES = {
  // Success messages
  SUB_CATEGORIES_RETRIEVED_SUCCESSFULLY: "Sub-categories retrieved successfully",
  SUB_CATEGORY_RETRIEVED_SUCCESSFULLY: "Sub-category retrieved successfully",
  SUB_CATEGORY_CREATED_SUCCESSFULLY: "Sub-category created successfully",
  SUB_CATEGORY_UPDATED_SUCCESSFULLY: "Sub-category updated successfully",
  SUB_CATEGORY_DELETED_SUCCESSFULLY: "Sub-category deleted successfully",

  // Error messages
  SUB_CATEGORY_NOT_FOUND: "Sub-category not found",
  SUB_CATEGORY_ALREADY_EXISTS: "Sub-category already exists",
  INVALID_SUB_CATEGORY_DATA: "Invalid sub-category data",
  FAILED_TO_CREATE_SUB_CATEGORY: "Failed to create sub-category",
  FAILED_TO_UPDATE_SUB_CATEGORY: "Failed to update sub-category",
  FAILED_TO_DELETE_SUB_CATEGORY: "Failed to delete sub-category",
  CATEGORY_NOT_FOUND: "Category not found",
} as const;

/**
 * SubCategory sort fields
 */
export const SUB_CATEGORY_SORT_FIELDS = {
  NAME: "name",
  SLUG: "slug",
  CREATED_ON: "createdOn",
} as const;

export type SubCategorySortField = (typeof SUB_CATEGORY_SORT_FIELDS)[keyof typeof SUB_CATEGORY_SORT_FIELDS];
