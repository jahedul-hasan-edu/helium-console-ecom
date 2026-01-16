/**
 * Category model interfaces
 */

export interface Category {
  id: string;
  tenantId: string | null;
  mainCategoryId: string | null;
  name: string | null;
  slug: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: string | null;
  updatedOn: string | null;
  userIp: string | null;
}

export interface CreateCategoryRequest {
  mainCategoryId: string;
  name: string;
  slug: string;
}

export interface UpdateCategoryRequest {
  mainCategoryId?: string;
  name?: string;
  slug?: string;
}

export interface GetCategoriesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetCategoriesResponse {
  items: Category[];
  total: number;
  page: number;
  pageSize: number;
}
