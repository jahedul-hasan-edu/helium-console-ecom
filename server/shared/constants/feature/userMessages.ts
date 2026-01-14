/**
 * User feature messages
 * All user-related success and failure messages
 */
export const USER_MESSAGES = {
  // Success messages
  USERS_RETRIEVED_SUCCESSFULLY: "Users retrieved successfully",
  USER_RETRIEVED_SUCCESSFULLY: "User retrieved successfully",
  USER_CREATED_SUCCESSFULLY: "User created successfully",
  USER_UPDATED_SUCCESSFULLY: "User updated successfully",
  USER_DELETED_SUCCESSFULLY: "User deleted successfully",

  // Error messages
  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User already exists",
  INVALID_USER_DATA: "Invalid user data",
  FAILED_TO_CREATE_USER: "Failed to create user",
  FAILED_TO_UPDATE_USER: "Failed to update user",
  FAILED_TO_DELETE_USER: "Failed to delete user",
} as const;

/**
 * User sort fields
 */
export const USER_SORT_FIELDS = {
  NAME: "name",
  EMAIL: "email",
  CREATED_ON: "createdOn",
} as const;

export type UserSortField = (typeof USER_SORT_FIELDS)[keyof typeof USER_SORT_FIELDS];
