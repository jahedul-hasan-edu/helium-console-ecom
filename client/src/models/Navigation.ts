export interface PagePermissions {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canPreview: boolean;
}

export interface NavigationItem {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  routePath: string;
  parentId: string | null;
  sortOrder: number;
  permissions?: PagePermissions;
  children?: NavigationItem[];
}