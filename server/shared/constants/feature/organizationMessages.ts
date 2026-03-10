export const ORGANIZATION_MESSAGES = {
  ORGANIZATIONS_RETRIEVED_SUCCESSFULLY: "Organizations retrieved successfully",
  ORGANIZATION_RETRIEVED_SUCCESSFULLY: "Organization retrieved successfully",
  ORGANIZATION_CREATED_SUCCESSFULLY: "Organization created successfully",
  ORGANIZATION_UPDATED_SUCCESSFULLY: "Organization updated successfully",
  ORGANIZATION_DELETED_SUCCESSFULLY: "Organization deleted successfully",

  ORGANIZATION_NOT_FOUND: "Organization not found",
  ORGANIZATION_ALREADY_EXISTS: "Organization with this title already exists for this tenant",
  INVALID_ORGANIZATION_DATA: "Invalid organization data",
  INVALID_ORGANIZATION_IMAGE: "Organization image must be an image file smaller than 1MB",
  FAILED_TO_CREATE_ORGANIZATION: "Failed to create organization",
  FAILED_TO_UPDATE_ORGANIZATION: "Failed to update organization",
  FAILED_TO_DELETE_ORGANIZATION: "Failed to delete organization",
} as const;

export const ORGANIZATION_SORT_FIELDS = {
  TITLE: "title",
  LOGO_TITLE: "logoTitle",
  EMAIL: "email",
  CREATED_ON: "createdOn",
} as const;

export type OrganizationSortField = (typeof ORGANIZATION_SORT_FIELDS)[keyof typeof ORGANIZATION_SORT_FIELDS];