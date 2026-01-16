/**
 * SubCategory model interfaces
 */

export interface SubCategory {
  id: string;
  tenantId: string | null;
  categoryId: string | null;
  name: string | null;
  slug: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: string | null;
  updatedOn: string | null;
  userIp: string | null;
}

export interface CreateSubCategoryRequest {
  categoryId: string;
  name: string;
  slug: string;
}

export interface UpdateSubCategoryRequest {
  categoryId?: string;
  name?: string;
  slug?: string;
}

export interface GetSubCategoriesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetSubCategoriesResponse {
  items: SubCategory[];
  total: number;
  page: number;
  pageSize: number;
}
