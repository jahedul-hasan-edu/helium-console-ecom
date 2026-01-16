/**
 * SubCategory feature constants
 */

// Page size options for pagination
export const SUB_CATEGORY_PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50];

// Sort field options (maps to API sort fields)
export const SUB_CATEGORY_SORT_FIELDS = {
  NAME: "name",
  SLUG: "slug",
  CREATED_ON: "createdOn",
} as const;

export type SubCategorySortField = (typeof SUB_CATEGORY_SORT_FIELDS)[keyof typeof SUB_CATEGORY_SORT_FIELDS];

// Column definitions for data table
export const SUB_CATEGORY_COLUMNS = [
  { key: "name", label: "Name", sortable: true },
  { key: "slug", label: "Slug", sortable: true },
  { key: "categoryId", label: "Category", sortable: false },
  { key: "createdOn", label: "Created On", sortable: true },
  { key: "actions", label: "Actions", sortable: false },
] as const;

// SubCategory feature title
export const SUB_CATEGORY_FEATURE_TITLE = "Sub Category Management";

// SubCategory feature description
export const SUB_CATEGORY_FEATURE_DESCRIPTION = "Manage your product sub-categories";
