export interface PagePermissionRole {
  id: string;
  name: string;
  displayName: string;
  isSystem: boolean;
}

export interface PagePermissionEntry {
  id: string;
  title: string;
  slug: string;
  icon?: string | null;
  routePath: string;
  sortOrder: number;
  isSystem: boolean;
  isActive: boolean;
  enabled: boolean;
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canPreview: boolean;
}

export interface RolePagePermissions {
  role: PagePermissionRole;
  pages: PagePermissionEntry[];
}

export interface UpdatePagePermissionsRequest {
  entries: Array<{
    pageId: string;
    enabled: boolean;
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canPreview: boolean;
  }>;
}