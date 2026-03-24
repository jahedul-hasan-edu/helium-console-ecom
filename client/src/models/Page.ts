export interface AdminPage {
  id: string;
  title: string;
  slug: string;
  icon?: string | null;
  parentId?: string | null;
  sortOrder: number;
  routePath: string;
  isActive: boolean;
  isSystem: boolean;
  createdOn?: Date | null;
  updatedOn?: Date | null;
}

export interface CreatePageRequest {
  title: string;
  slug: string;
  icon?: string | null;
  parentId?: string | null;
  sortOrder: number;
  routePath: string;
  isActive?: boolean;
}

export interface UpdatePageRequest extends Partial<CreatePageRequest> {}