/**
 * Tenant feature messages
 * All tenant-related success and failure messages
 */
export const TENANT_MESSAGES = {
  // Success messages
  TENANTS_RETRIEVED_SUCCESSFULLY: "Tenants retrieved successfully",
  TENANT_RETRIEVED_SUCCESSFULLY: "Tenant retrieved successfully",
  TENANT_CREATED_SUCCESSFULLY: "Tenant created successfully",
  TENANT_UPDATED_SUCCESSFULLY: "Tenant updated successfully",
  TENANT_DELETED_SUCCESSFULLY: "Tenant deleted successfully",

  // Error messages
  TENANT_NOT_FOUND: "Tenant not found",
  TENANT_ALREADY_EXISTS: "Tenant already exists",
  INVALID_TENANT_DATA: "Invalid tenant data",
  FAILED_TO_CREATE_TENANT: "Failed to create tenant",
  FAILED_TO_UPDATE_TENANT: "Failed to update tenant",
  FAILED_TO_DELETE_TENANT: "Failed to delete tenant",
} as const;

/**
 * Tenant sort fields
 */
export const TENANT_SORT_FIELDS = {
  NAME: "name",
  DOMAIN: "domain",
  CREATED_ON: "createdOn",
} as const;

export type TenantSortField = (typeof TENANT_SORT_FIELDS)[keyof typeof TENANT_SORT_FIELDS];
