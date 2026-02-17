/**
 * Popup Ad feature messages
 * All Popup Ad-related success and failure messages
 */
export const POPUP_AD_MESSAGES = {
  // Success messages
  POPUP_ADS_RETRIEVED_SUCCESSFULLY: "Popup Ads retrieved successfully",
  POPUP_AD_RETRIEVED_SUCCESSFULLY: "Popup Ad retrieved successfully",
  POPUP_AD_CREATED_SUCCESSFULLY: "Popup Ad created successfully",
  POPUP_AD_UPDATED_SUCCESSFULLY: "Popup Ad updated successfully",
  POPUP_AD_DELETED_SUCCESSFULLY: "Popup Ad deleted successfully",

  // Error messages
  POPUP_AD_NOT_FOUND: "Popup Ad not found",
  POPUP_AD_ALREADY_EXISTS: "Popup Ad with this title already exists for this tenant",
  INVALID_POPUP_AD_DATA: "Invalid Popup Ad data",
  FAILED_TO_CREATE_POPUP_AD: "Failed to create Popup Ad",
  FAILED_TO_UPDATE_POPUP_AD: "Failed to update Popup Ad",
  FAILED_TO_DELETE_POPUP_AD: "Failed to delete Popup Ad",
} as const;

/**
 * Popup Ad sort fields
 */
export const POPUP_AD_SORT_FIELDS = {
  TITLE: "title",
  CREATED_ON: "createdOn",
} as const;

export type PopupAdSortField = (typeof POPUP_AD_SORT_FIELDS)[keyof typeof POPUP_AD_SORT_FIELDS];
