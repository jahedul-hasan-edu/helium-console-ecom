import type { QueryParams } from "@/lib/interface";

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

export type PageSortField = "title" | "slug" | "routePath" | "sortOrder" | "createdOn" | "updatedOn";

export interface GetPagesParams extends QueryParams {
  sortBy?: PageSortField;
}