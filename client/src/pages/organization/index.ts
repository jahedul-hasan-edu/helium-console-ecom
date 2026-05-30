export const ORGANIZATION_PAGE = {
  TITLE: "Organizations",
  SUBTITLE: "Manage organization profiles, contact details, policies, and branding.",
  SEARCH_PLACEHOLDER: "Search by title, logo title, email, or phone...",
  TENANT_FILTER_PLACEHOLDER: "All Tenants",
  EMPTY_MESSAGE: "No organizations found.",
} as const;

export const BUTTON_LABELS = {
  ADD_ORGANIZATION: "Add Organization",
  CREATE_ORGANIZATION: "Create Organization",
  UPDATE_ORGANIZATION: "Update Organization",
  DELETE_ORGANIZATION: "Delete Organization",
  CANCEL: "Cancel",
} as const;

export const ERROR_MESSAGES = {
  CREATE_ORGANIZATION_FAILED: "Failed to create organization",
  UPDATE_ORGANIZATION_FAILED: "Failed to update organization",
  DELETE_ORGANIZATION_FAILED: "Failed to delete organization",
} as const;

export const COLUMNS = [
  {
    key: "imageUrl" as const,
    label: "Logo",
    sortable: false,
    width: "88px",
  },
  {
    key: "title" as const,
    label: "Title",
    sortable: true,
  },
  {
    key: "logoTitle" as const,
    label: "Logo Title",
    sortable: true,
  },
  {
    key: "email" as const,
    label: "Email",
    sortable: true,
  },
  {
    key: "phone" as const,
    label: "Phone",
    sortable: false,
  },
  {
    key: "isActive" as const,
    label: "Status",
    sortable: false,
  },
] as const;

export const SORTABLE_FIELDS = {
  TITLE: "title",
  LOGO_TITLE: "logoTitle",
  EMAIL: "email",
  CREATED_ON: "createdOn",
} as const;

export type SortField = (typeof SORTABLE_FIELDS)[keyof typeof SORTABLE_FIELDS];
export type SortOrder = "asc" | "desc";

export const SORT_CONFIG = {
  ORDERS: {
    ASC: "asc" as const,
    DESC: "desc" as const,
  },
} as const;

export const IMAGE_CONFIG = {
  MAX_FILE_SIZE_MB: 1,
  ACCEPTED_FORMATS: ["image/jpeg", "image/png", "image/webp"],
  ACCEPTED_EXTENSIONS: ".jpg,.jpeg,.png,.webp",
} as const;

export interface OrganizationFormValues {
  title: string;
  logoTitle: string;
  phone: string;
  email: string;
  address: string;
  socialFbUrl: string;
  socialInUrl: string;
  socialXUrl: string;
  socialUtubeUrl: string;
  license: string;
  privacyPolicy: string;
  returnPolicy: string;
  isActive: boolean;
}

export const EMPTY_ORGANIZATION_FORM: OrganizationFormValues = {
  title: "",
  logoTitle: "",
  phone: "",
  email: "",
  address: "",
  socialFbUrl: "",
  socialInUrl: "",
  socialXUrl: "",
  socialUtubeUrl: "",
  license: "",
  privacyPolicy: "",
  returnPolicy: "",
  isActive: true,
};

export const ORGANIZATION_FORM = {
  TENANT_LABEL: "Tenant",
  TENANT_PLACEHOLDER: "Select a tenant",
  TITLE_LABEL: "Organization Title",
  TITLE_PLACEHOLDER: "Enter the organization title",
  LOGO_TITLE_LABEL: "Logo Title",
  LOGO_TITLE_PLACEHOLDER: "Enter the text shown with the logo",
  PHONE_LABEL: "Phone",
  PHONE_PLACEHOLDER: "Enter the main support phone number",
  EMAIL_LABEL: "Email",
  EMAIL_PLACEHOLDER: "Enter the primary contact email",
  ADDRESS_LABEL: "Address",
  ADDRESS_PLACEHOLDER: "Enter HTML or plain text address content",
  ADDRESS_HELPER: "HTML and plain text are supported.",
  LICENSE_LABEL: "License",
  LICENSE_PLACEHOLDER: "Enter license details",
  PRIVACY_POLICY_LABEL: "Privacy Policy",
  PRIVACY_POLICY_PLACEHOLDER: "Enter HTML or plain text privacy policy content",
  PRIVACY_POLICY_HELPER: "HTML and plain text are supported.",
  RETURN_POLICY_LABEL: "Return Policy",
  RETURN_POLICY_PLACEHOLDER: "Enter HTML or plain text return policy content",
  RETURN_POLICY_HELPER: "HTML and plain text are supported.",
  SOCIAL_FB_LABEL: "Facebook URL",
  SOCIAL_IN_LABEL: "LinkedIn URL",
  SOCIAL_X_LABEL: "X URL",
  SOCIAL_UTUBE_LABEL: "YouTube URL",
  SOCIAL_PLACEHOLDER: "https://example.com/your-page",
  IMAGE_LABEL: "Organization Image",
  IMAGE_HELPER: "Upload a single JPEG, PNG, or WebP image up to 1MB.",
  ACTIVE_LABEL: "Active",
  ACTIVE_HELPER: "Control whether the organization profile is active.",
  VALIDATION: {
    TENANT_REQUIRED: "Tenant is required",
    TITLE_REQUIRED: "Organization title is required",
    TITLE_MAX_LENGTH: "Organization title must be less than 255 characters",
    LOGO_TITLE_REQUIRED: "Logo title is required",
    LOGO_TITLE_MAX_LENGTH: "Logo title must be less than 255 characters",
    PHONE_REQUIRED: "Phone is required",
    PHONE_INVALID: "Phone must contain 7 to 20 valid characters",
    EMAIL_REQUIRED: "Email is required",
    EMAIL_INVALID: "Email must be a valid email address",
    ADDRESS_REQUIRED: "Address is required",
    LICENSE_REQUIRED: "License is required",
    PRIVACY_POLICY_REQUIRED: "Privacy policy is required",
    RETURN_POLICY_REQUIRED: "Return policy is required",
    SOCIAL_FB_REQUIRED: "Facebook URL is required",
    SOCIAL_IN_REQUIRED: "LinkedIn URL is required",
    SOCIAL_X_REQUIRED: "X URL is required",
    SOCIAL_UTUBE_REQUIRED: "YouTube URL is required",
    URL_INVALID: "Please enter a valid URL including http:// or https://",
    IMAGE_INVALID_TYPE: "Only JPEG, PNG, and WebP images are allowed",
    IMAGE_TOO_LARGE: "Image must be 1MB or smaller",
  },
} as const;

export const TENANT_FILTER_ALL_VALUE = "__all__";

export const TOTAL_PAGES = (data?: { total?: number; pageSize?: number }) =>
  data?.total ? Math.ceil(data.total / (data.pageSize || 10)) : 0;