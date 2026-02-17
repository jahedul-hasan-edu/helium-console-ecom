/**
 * Popup Ad Routes
 */
export { api as POPUP_AD_ROUTES } from "@/routes/popupAdRoute";

/**
 * Popup Ad Page Configuration
 */
export const POPUP_AD_PAGE = {
  title: "Popup Ads",
  subtitle: "Manage your popup advertisements",
  searchPlaceholder: "Search by title...",
  emptyMessage: "No popup ads found",
} as const;

/**
 * Button Labels
 */
export const BUTTON_LABELS = {
  add: "Add Popup Ad",
  edit: "Edit",
  delete: "Delete",
  cancel: "Cancel",
  save: "Save",
  upload: "Upload Image",
  removeImage: "Remove Image",
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  requiredField: "This field is required",
  invalidTitle: "Title is required",
  invalidTenant: "Tenant is required",
  invalidImage: "Invalid image file",
  imageSizeLimit: "Image size must be less than 1MB",
  imageFormatError: "Only image files (JPEG, PNG, WebP) are allowed",
  duplicateTitle: "Popup Ad with this title already exists for this tenant",
  deletionError: "Failed to delete popup ad",
  creationError: "Failed to create popup ad",
  updateError: "Failed to update popup ad",
} as const;

/**
 * Column Configuration
 */
export const COLUMNS = [
  {
    key: "title" as const,
    label: "Title",
    sortable: true,
  },
  {
    key: "isActive" as const,
    label: "Status",
    sortable: false,
  }
] as const;

/**
 * Sortable Fields
 */
export const SORTABLE_FIELDS = {
  TITLE: "title",
  CREATED_ON: "createdOn",
} as const;

export type SortField = (typeof SORTABLE_FIELDS)[keyof typeof SORTABLE_FIELDS];
export type SortOrder = "asc" | "desc";

/**
 * Sort Configuration
 */
export const SORT_CONFIG = {
  ORDERS: {
    ASC: "asc" as const,
    DESC: "desc" as const,
  },
} as const;

/**
 * Action Buttons Configuration
 */
export const ACTION_BUTTONS = [
  { id: "edit", label: "Edit", icon: "edit" },
  { id: "delete", label: "Delete", icon: "trash" },
] as const;

export const TOTAL_PAGES = (data: any) => {
  return data?.total ? Math.ceil(data.total / 10) : 0;
};

/**
 * Form Field Labels
 */
export const POPUP_AD_FORM = {
  title: "Title",
  titlePlaceholder: "Enter popup ad title",
  titleHelper: "The display title for this popup ad",
  tenantLabel: "Tenant",
  tenantPlaceholder: "Select a tenant",
  image: "Image",
  imageHelper: "Upload a single image (JPEG, PNG, WebP - Max 1MB)",
  isActive: "Active",
  isActiveHelper: "Whether this popup ad is active",
  imageSection: "Popup Ad Image",
  currentImage: "Current Image",
  noImage: "No image uploaded",
  dragDropText: "Drag and drop your image here, or click to select",
  selectImageButton: "Select Image",
} as const;

/**
 * Image Upload Configuration
 */
export const IMAGE_CONFIG = {
  maxFileSize: 1, // 1MB
  acceptedFormats: ["image/jpeg", "image/png", "image/webp"],
  acceptedExtensions: ".jpg,.jpeg,.png,.webp",
} as const;

/**
 * Modal Configuration
 */
export const MODAL_CONFIG = {
  deleteTitle: "Delete Popup Ad",
  deleteDescription: "Are you sure you want to delete this popup ad? This action cannot be undone.",
  deleteConfirm: "Delete",
  deleteCancel: "Cancel",
} as const;
