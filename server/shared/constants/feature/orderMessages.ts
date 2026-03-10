export const ORDER_MESSAGES = {
  ORDERS_RETRIEVED_SUCCESSFULLY: "Orders retrieved successfully",
  ORDER_RETRIEVED_SUCCESSFULLY: "Order retrieved successfully",
  ORDER_CREATED_SUCCESSFULLY: "Order created successfully",
  ORDER_UPDATED_SUCCESSFULLY: "Order updated successfully",
  ORDER_DELETED_SUCCESSFULLY: "Order deleted successfully",

  ORDER_NOT_FOUND: "Order not found",
  INVALID_ORDER_DATA: "Invalid order data",
  FAILED_TO_CREATE_ORDER: "Failed to create order",
  FAILED_TO_UPDATE_ORDER: "Failed to update order",
  FAILED_TO_DELETE_ORDER: "Failed to delete order",
} as const;

export const ORDER_SORT_FIELDS = {
  STATUS: "status",
  EMAIL: "email",
  CREATED_ON: "createdOn",
  UPDATED_ON: "updatedOn",
} as const;

export type OrderSortField = (typeof ORDER_SORT_FIELDS)[keyof typeof ORDER_SORT_FIELDS];