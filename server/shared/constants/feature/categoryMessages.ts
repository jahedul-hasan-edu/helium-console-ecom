/**
 * Category feature messages
 * All category-related success and failure messages
 */
export const CATEGORY_MESSAGES = {
  // Success messages
  CATEGORIES_RETRIEVED_SUCCESSFULLY: "Categories retrieved successfully",
  CATEGORY_RETRIEVED_SUCCESSFULLY: "Category retrieved successfully",
  CATEGORY_CREATED_SUCCESSFULLY: "Category created successfully",
  CATEGORY_UPDATED_SUCCESSFULLY: "Category updated successfully",
  CATEGORY_DELETED_SUCCESSFULLY: "Category deleted successfully",

  // Error messages
  CATEGORY_NOT_FOUND: "Category not found",
  CATEGORY_ALREADY_EXISTS: "Category already exists",
  INVALID_CATEGORY_DATA: "Invalid category data",
  FAILED_TO_CREATE_CATEGORY: "Failed to create category",
  FAILED_TO_UPDATE_CATEGORY: "Failed to update category",
  FAILED_TO_DELETE_CATEGORY: "Failed to delete category",
  MAIN_CATEGORY_NOT_FOUND: "Main category not found",
} as const;

/**
 * Category sort fields
 */
export const CATEGORY_SORT_FIELDS = {
  NAME: "name",
  SLUG: "slug",
  CREATED_ON: "createdOn",
} as const;

export type CategorySortField = (typeof CATEGORY_SORT_FIELDS)[keyof typeof CATEGORY_SORT_FIELDS];
