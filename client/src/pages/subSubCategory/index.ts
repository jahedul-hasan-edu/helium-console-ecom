/**
 * SubSubCategory feature constants
 */

import { Column } from "@/components/DataTable";
import { ListResponse } from "@/lib/interface";
import { SubSubCategory } from "@/models/SubSubCategory";

// Page size options for pagination
export const SUB_SUB_CATEGORY_PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50];

// Sort field options (maps to API sort fields)
export const SUB_SUB_CATEGORY_SORT_FIELDS = {
  NAME: "name",
  SLUG: "slug",
  CREATED_ON: "createdOn",
} as const;

export type SubSubCategorySortField = (typeof SUB_SUB_CATEGORY_SORT_FIELDS)[keyof typeof SUB_SUB_CATEGORY_SORT_FIELDS];

export const COLUMNS_LABEL = {
  NAME: "Name",
  SLUG: "Slug",
  SUB_CATEGORY: "Sub Category",
  CREATED_ON: "Created On",
  ACTIONS: "Actions",
} as const;

export const COLUMNS: Column<SubSubCategory>[] = [
    {
      key: "name",
      label: COLUMNS_LABEL.NAME,
      sortable: true,
      render: (_: any, subSubCategory: SubSubCategory) => subSubCategory.name || "-",
    },
    {
      key: "slug",
      label: COLUMNS_LABEL.SLUG,
      sortable: true,
      render: (_: any, subSubCategory: SubSubCategory) => subSubCategory.slug || "-",
    },
    {
      key: "subCategoryName",
      label: COLUMNS_LABEL.SUB_CATEGORY,
      sortable: true,
      render: (_: any, subSubCategory: SubSubCategory) => subSubCategory.subCategoryName || "-",
    }
  ];

export const TOTAL_PAGES = (data: ListResponse<SubSubCategory>) => data ? Math.ceil(data.total / data.pageSize) : 0;
