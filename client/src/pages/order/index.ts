import { SORT_ORDERS } from "@/lib/constants";

export const ORDERS_PAGE = {
  TITLE: "Orders",
  SUBTITLE: "View incoming orders, check their status, and update them from one place.",
  SEARCH_PLACEHOLDER: "Search by order ID, status, email, mobile, or address...",
  TENANT_FILTER_PLACEHOLDER: "All Tenants",
  EMPTY_MESSAGE: "No orders found.",
} as const;

export const BUTTON_LABELS = {
  ADD_ORDER: "Add Order",
  CREATE_ORDER: "Create Order",
  UPDATE_ORDER: "Update Order",
  DELETE_ORDER: "Delete Order",
  CANCEL: "Cancel",
} as const;

export const ERROR_MESSAGES = {
  CREATE_ORDER_FAILED: "Failed to create order",
  UPDATE_ORDER_FAILED: "Failed to update order",
  DELETE_ORDER_FAILED: "Failed to delete order",
} as const;

export const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const COLUMNS = [
  {
    key: "id" as const,
    label: "Order ID",
    sortable: false,
    width: "140px",
  },
  {
    key: "tenantId" as const,
    label: "Tenant",
    sortable: false,
    width: "180px",
  },
  {
    key: "status" as const,
    label: "Status",
    sortable: true,
    width: "150px",
  },
  {
    key: "email" as const,
    label: "Contact",
    sortable: true,
  },
  {
    key: "deliveryTime" as const,
    label: "Delivery",
    sortable: false,
  },
  {
    key: "reusableBag" as const,
    label: "Reusable Bag",
    sortable: false,
    width: "130px",
  },
  {
    key: "createdOn" as const,
    label: "Created",
    sortable: true,
    width: "190px",
  },
] as const;

export const SORTABLE_FIELDS = {
  STATUS: "status",
  EMAIL: "email",
  CREATED_ON: "createdOn",
  UPDATED_ON: "updatedOn",
} as const;

export type SortField = (typeof SORTABLE_FIELDS)[keyof typeof SORTABLE_FIELDS];
export type SortOrder = typeof SORT_ORDERS[keyof typeof SORT_ORDERS];

export const SORT_CONFIG = {
  ORDERS: {
    ASC: SORT_ORDERS.ASC as SortOrder,
    DESC: SORT_ORDERS.DESC as SortOrder,
  },
} as const;

export interface OrderFormValues {
  tenantId: string;
  status: string;
  address: string;
  mobile: string;
  email: string;
  deliveryTime: string;
  timeZone: string;
  reusableBag: boolean;
}

export const EMPTY_ORDER_FORM: OrderFormValues = {
  tenantId: "",
  status: ORDER_STATUS_OPTIONS[0].value,
  address: "",
  mobile: "",
  email: "",
  deliveryTime: "",
  timeZone: "",
  reusableBag: false,
};

export const ORDER_FORM = {
  TENANT_LABEL: "Tenant",
  TENANT_PLACEHOLDER: "Select a tenant",
  STATUS_LABEL: "Order Status",
  STATUS_PLACEHOLDER: "Select an order status",
  EMAIL_LABEL: "Email",
  EMAIL_PLACEHOLDER: "customer@example.com",
  MOBILE_LABEL: "Mobile",
  MOBILE_PLACEHOLDER: "+1 234 567 890",
  DELIVERY_TIME_LABEL: "Delivery Time",
  DELIVERY_TIME_PLACEHOLDER: "Tomorrow 4PM - 6PM",
  TIME_ZONE_LABEL: "Time Zone",
  TIME_ZONE_PLACEHOLDER: "UTC+6 / Asia-Dhaka",
  ADDRESS_LABEL: "Address",
  ADDRESS_PLACEHOLDER: "Enter the delivery address or internal notes",
  REUSABLE_BAG_LABEL: "Reusable Bag",
  REUSABLE_BAG_HELPER: "Track whether the customer requested a reusable bag.",
  VALIDATION: {
    TENANT_REQUIRED: "Tenant is required",
    STATUS_REQUIRED: "Order status is required",
    STATUS_TOO_LONG: "Order status must be 50 characters or less",
    EMAIL_INVALID: "Email must be a valid email address",
    MOBILE_INVALID: "Mobile must contain 7 to 20 valid characters",
    FIELD_TOO_LONG: "Value must be 500 characters or less",
  },
} as const;

export const TENANT_FILTER_ALL_VALUE = "__all__";

export const TOTAL_PAGES = (data?: { total?: number; pageSize?: number }) =>
  data?.total ? Math.ceil(data.total / (data.pageSize || 10)) : 1;

export function formatOrderStatusLabel(status: string | null | undefined) {
  if (!status) {
    return "Unknown";
  }

  return status
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}