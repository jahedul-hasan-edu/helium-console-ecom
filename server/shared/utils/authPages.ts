export type PermissionKey = "canView" | "canCreate" | "canUpdate" | "canDelete" | "canPreview";

export interface StaticPageDefinition {
  title: string;
  slug: string;
  icon: string;
  routePath: string;
  sortOrder: number;
  parentId: string | null;
}

export const STATIC_PAGE_DEFINITIONS: StaticPageDefinition[] = [
  { title: "Dashboard", slug: "dashboard", icon: "LayoutDashboard", routePath: "/admin", sortOrder: 1, parentId: null },
  { title: "Subscription Plans", slug: "subscription-plans", icon: "Package", routePath: "/admin/subscription-plans", sortOrder: 2, parentId: null },
  { title: "Tenants", slug: "tenants", icon: "Building2", routePath: "/admin/tenants", sortOrder: 3, parentId: null },
  { title: "Tenant Subscriptions", slug: "tenant-subscriptions", icon: "Briefcase", routePath: "/admin/tenant-subscriptions", sortOrder: 4, parentId: null },
  { title: "User Settings", slug: "user-settings", icon: "Settings", routePath: "/admin/user-settings", sortOrder: 5, parentId: null },
  { title: "Users", slug: "users", icon: "Users", routePath: "/admin/users", sortOrder: 6, parentId: null },
  { title: "Organizations", slug: "organizations", icon: "Building", routePath: "/admin/organizations", sortOrder: 7, parentId: null },
  { title: "Main Categories", slug: "main-categories", icon: "Layers", routePath: "/admin/main-categories", sortOrder: 8, parentId: null },
  { title: "Categories", slug: "categories", icon: "FolderTree", routePath: "/admin/categories", sortOrder: 9, parentId: null },
  { title: "Sub Categories", slug: "sub-categories", icon: "FolderOpen", routePath: "/admin/sub-categories", sortOrder: 10, parentId: null },
  { title: "Sub Sub Categories", slug: "sub-sub-categories", icon: "FolderClosed", routePath: "/admin/sub-sub-categories", sortOrder: 11, parentId: null },
  { title: "Products", slug: "products", icon: "ShoppingBag", routePath: "/admin/products", sortOrder: 12, parentId: null },
  { title: "Orders", slug: "orders", icon: "ShoppingCart", routePath: "/admin/orders", sortOrder: 13, parentId: null },
  { title: "FAQs", slug: "faqs", icon: "HelpCircle", routePath: "/admin/faqs", sortOrder: 14, parentId: null },
  { title: "Home Settings", slug: "home-settings", icon: "Home", routePath: "/admin/home-settings", sortOrder: 15, parentId: null },
  { title: "Popup Ads", slug: "popup-ads", icon: "Megaphone", routePath: "/admin/popup-ads", sortOrder: 16, parentId: null },
  { title: "Pages", slug: "pages", icon: "FileText", routePath: "/admin/pages", sortOrder: 17, parentId: null },
  { title: "Roles", slug: "roles", icon: "Shield", routePath: "/admin/roles", sortOrder: 18, parentId: null },
  { title: "Page Permissions", slug: "page-permissions", icon: "Settings", routePath: "/admin/page-permissions", sortOrder: 19, parentId: null },
];

export const HIDDEN_NAVIGATION_PAGE_SLUGS = ["users", "roles", "page-permissions"] as const;

export const SUPER_ADMIN_ONLY_PAGE_SLUGS = ["subscription-plans", "tenants", "tenant-subscriptions", "pages"] as const;

export const ADMIN_ROUTE_PAGE_MAP: Record<string, string> = {
  categories: "categories",
  faqs: "faqs",
  "home-settings": "home-settings",
  navigation: "dashboard",
  "main-categories": "main-categories",
  orders: "orders",
  organizations: "organizations",
  "popup-ads": "popup-ads",
  "page-permissions": "page-permissions",
  pages: "pages",
  products: "products",
  roles: "roles",
  "sub-categories": "sub-categories",
  "sub-sub-categories": "sub-sub-categories",
  "subscription-plans": "subscription-plans",
  tenants: "tenants",
  "tenant-subscriptions": "tenant-subscriptions",
  users: "users",
};

export const HTTP_METHOD_PERMISSION_MAP: Record<string, PermissionKey> = {
  DELETE: "canDelete",
  GET: "canView",
  PATCH: "canUpdate",
  POST: "canCreate",
  PUT: "canUpdate",
};