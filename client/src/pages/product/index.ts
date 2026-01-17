/**
 * Product page constants
 */

import { Column } from "@/components/PaginatedDataTable";
import { ListResponse } from "@/lib/interface";
import { Product } from "@/models/Product";

export const PRODUCT_PAGE = {
  title: "Products",
  subtitle: "Manage product catalog",
  searchPlaceholder: "Search products by name or description...",
  emptyMessage: "No products found",
};

export const BUTTON_LABELS = {
  add: "Add Product",
  edit: "Edit",
  delete: "Delete",
  save: "Save",
  cancel: "Cancel",
  create: "Create",
  update: "Update",
};

export const ERROR_MESSAGES = {
  loadFailed: "Failed to load products",
  createFailed: "Failed to create product",
  updateFailed: "Failed to update product",
  deleteFailed: "Failed to delete product",
  validation: "Please fix validation errors",
};

export const PRODUCT_COLUMNS_LABEL = {
  NAME: "Name",
  SUB_CATEGORY: "Sub Category",
  SUB_SUB_CATEGORY: "Sub Sub Category",
  PRICE: "Price",
  STOCK: "Stock",
  ACTIVE: "Active",
};

// Base columns without render functions (render will be added in the .tsx file)
export const BASE_COLUMNS: Omit<Column<Product>, 'render'>[] = [
  { key: "name", label: PRODUCT_COLUMNS_LABEL.NAME, sortable: true },
  { key: "subCategoryName", label: PRODUCT_COLUMNS_LABEL.SUB_CATEGORY, sortable: false },
  { key: "subSubCategoryName", label: PRODUCT_COLUMNS_LABEL.SUB_SUB_CATEGORY, sortable: false },
  { key: "price", label: PRODUCT_COLUMNS_LABEL.PRICE, sortable: true },
  { key: "stock", label: PRODUCT_COLUMNS_LABEL.STOCK, sortable: true },
  { key: "isActive", label: PRODUCT_COLUMNS_LABEL.ACTIVE, sortable: false }
];

export type SortField = "name" | "price" | "stock" | "createdOn";

export const SORTABLE_FIELDS = {
  NAME: "name" as SortField,
  PRICE: "price" as SortField,
  STOCK: "stock" as SortField,
  CREATED_ON: "createdOn" as SortField,
};

export const SORT_CONFIG = {
  ASC: "asc" as const,
  DESC: "desc" as const,
};

export type SortOrder = typeof SORT_CONFIG.ASC | typeof SORT_CONFIG.DESC;

export const ACTION_BUTTONS = {
  edit: { label: BUTTON_LABELS.edit, variant: "ghost" as const },
  delete: { label: BUTTON_LABELS.delete, variant: "ghost" as const },
};

export const PRODUCT_FORM = {
  fields: {
    subCategoryId: {
      label: "Sub Category",
      placeholder: "Search sub category...",
      required: true,
    },
    subSubCategoryId: {
      label: "Sub Sub Category",
      placeholder: "Search sub sub category...",
      required: true,
    },
    name: {
      label: "Name",
      placeholder: "Enter product name",
      required: true,
    },
    description: {
      label: "Description",
      placeholder: "Enter product description",
      required: true,
    },
    price: {
      label: "Price",
      placeholder: "0.00",
      required: true,
    },
    stock: {
      label: "Stock",
      placeholder: "0",
      required: true,
    },
    isActive: {
      label: "Active",
      required: true,
    },
  },
  validation: {
    subCategoryId: "Sub category is required",
    subSubCategoryId: "Sub sub category is required",
    name: "Name is required",
    description: "Description is required",
    price: "Price must be a positive number",
    stock: "Stock must be a positive integer",
  },
};

export const TOTAL_PAGES = (productsData: ListResponse<Product>) => productsData ? Math.ceil(productsData.total / productsData.pageSize) : 0;