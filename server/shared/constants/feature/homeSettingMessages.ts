/**
 * Home Setting feature messages
 * All Home Setting-related success and failure messages
 */
export const HOME_SETTING_MESSAGES = {
  // Success messages
  HOME_SETTINGS_RETRIEVED_SUCCESSFULLY: "Home Settings retrieved successfully",
  HOME_SETTING_RETRIEVED_SUCCESSFULLY: "Home Setting retrieved successfully",
  HOME_SETTING_CREATED_SUCCESSFULLY: "Home Setting created successfully",
  HOME_SETTING_UPDATED_SUCCESSFULLY: "Home Setting updated successfully",
  HOME_SETTING_DELETED_SUCCESSFULLY: "Home Setting deleted successfully",

  // Error messages
  HOME_SETTING_NOT_FOUND: "Home Setting not found",
  HOME_SETTING_ALREADY_EXISTS: "Home Setting with this title already exists for this tenant",
  INVALID_HOME_SETTING_DATA: "Invalid Home Setting data",
  FAILED_TO_CREATE_HOME_SETTING: "Failed to create Home Setting",
  FAILED_TO_UPDATE_HOME_SETTING: "Failed to update Home Setting",
  FAILED_TO_DELETE_HOME_SETTING: "Failed to delete Home Setting",
} as const;

/**
 * Home Setting sort fields
 */
export const HOME_SETTING_SORT_FIELDS = {
  TITLE: "title",
  CREATED_ON: "createdOn",
} as const;

export type HomeSettingSortField = (typeof HOME_SETTING_SORT_FIELDS)[keyof typeof HOME_SETTING_SORT_FIELDS];
