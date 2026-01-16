/**
 * Category feature constants
 */

// Page size options for pagination
export const CATEGORY_PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50];

// Sort field options (maps to API sort fields)
export const CATEGORY_SORT_FIELDS = {
  NAME: "name",
  SLUG: "slug",
  CREATED_ON: "createdOn",
} as const;

export type CategorySortField = (typeof CATEGORY_SORT_FIELDS)[keyof typeof CATEGORY_SORT_FIELDS];

// Column definitions for data table
export const CATEGORY_COLUMNS = [
  { key: "name", label: "Name", sortable: true },
  { key: "slug", label: "Slug", sortable: true },
  { key: "mainCategoryId", label: "Main Category", sortable: false },
  { key: "createdOn", label: "Created On", sortable: true },
  { key: "actions", label: "Actions", sortable: false },
] as const;

// Category feature title
export const CATEGORY_FEATURE_TITLE = "Category Management";

// Category feature description
export const CATEGORY_FEATURE_DESCRIPTION = "Manage your product categories";
