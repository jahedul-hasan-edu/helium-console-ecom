/**
 * Category feature constants
 */

import { Column } from "@/components/DataTable";
import { ListResponse } from "@/lib/interface";
import { Category } from "@/models/Category";

// Page size options for pagination
export const CATEGORY_PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50];

// Sort field options (maps to API sort fields)
export const CATEGORY_SORT_FIELDS = {
  NAME: "name",
  SLUG: "slug",
  CREATED_ON: "createdOn",
} as const;

export type CategorySortField = (typeof CATEGORY_SORT_FIELDS)[keyof typeof CATEGORY_SORT_FIELDS];

export const COLUMNS_LABEL = {
  NAME: "Name",
  SLUG: "Slug",
  MAIN_CATEGORY: "Main Category",
};


export const COLUMNS: Column<Category>[] = [
    {
      key: "name",
      label: COLUMNS_LABEL.NAME,
      sortable: true,
      render: (_: any, category: Category) => category.name || "-",
    },
    {
      key: "slug",
      label: COLUMNS_LABEL.SLUG,
      sortable: true,
      render: (_: any, category: Category) => category.slug || "-",
    },
    {
      key: "id",
      label: COLUMNS_LABEL.MAIN_CATEGORY,
      sortable: false,
      render: (_: any, category: Category) => {
        return category.mainCategoryName || "-";
      },
    }
  ];

  export const TOTAL_PAGES = (data: ListResponse<Category>) => data ? Math.ceil(data.total / data.pageSize) : 0;