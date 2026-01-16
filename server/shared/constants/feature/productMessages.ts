// Product Messages
export const PRODUCT_MESSAGES = {
  RECORD_RETRIEVED: "Product retrieved successfully",
  RECORDS_RETRIEVED: "Products retrieved successfully",
  RECORD_CREATED: "Product created successfully",
  RECORD_UPDATED: "Product updated successfully",
  RECORD_DELETED: "Product deleted successfully",
  RECORD_NOT_FOUND: "Product not found",
  VALIDATION_ERROR: "Validation error",
  INVALID_SUB_CATEGORY: "Invalid sub category",
  INVALID_SUB_SUB_CATEGORY: "Invalid sub sub category",
  INVALID_PRICE: "Invalid price",
  INVALID_STOCK: "Invalid stock",
};

// Product Sort Fields
export const PRODUCT_SORT_FIELDS = {
  NAME: "name",
  PRICE: "price",
  STOCK: "stock",
  CREATED_ON: "createdOn",
} as const;

export type ProductSortField = typeof PRODUCT_SORT_FIELDS[keyof typeof PRODUCT_SORT_FIELDS];
