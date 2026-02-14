/**
 * FAQ feature messages
 * All FAQ-related success and failure messages
 */
export const FAQ_MESSAGES = {
  // Success messages
  FAQS_RETRIEVED_SUCCESSFULLY: "FAQs retrieved successfully",
  FAQ_RETRIEVED_SUCCESSFULLY: "FAQ retrieved successfully",
  FAQ_CREATED_SUCCESSFULLY: "FAQ created successfully",
  FAQ_UPDATED_SUCCESSFULLY: "FAQ updated successfully",
  FAQ_DELETED_SUCCESSFULLY: "FAQ deleted successfully",

  // Error messages
  FAQ_NOT_FOUND: "FAQ not found",
  FAQ_ALREADY_EXISTS: "FAQ with this title already exists for this tenant",
  INVALID_FAQ_DATA: "Invalid FAQ data",
  FAILED_TO_CREATE_FAQ: "Failed to create FAQ",
  FAILED_TO_UPDATE_FAQ: "Failed to update FAQ",
  FAILED_TO_DELETE_FAQ: "Failed to delete FAQ",
} as const;

/**
 * FAQ sort fields
 */
export const FAQ_SORT_FIELDS = {
  TITLE: "title",
  CREATED_ON: "createdOn",
} as const;

export type FAQSortField = (typeof FAQ_SORT_FIELDS)[keyof typeof FAQ_SORT_FIELDS];
