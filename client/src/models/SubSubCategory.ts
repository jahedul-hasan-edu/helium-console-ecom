/**
 * SubSubCategory model interfaces
 */

export interface SubSubCategory {
  id: string;
  tenantId: string | null;
  subCategoryId: string | null;
  name: string | null;
  slug: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: string | null;
  updatedOn: string | null;
  userIp: string | null;
}

export interface CreateSubSubCategoryRequest {
  subCategoryId: string;
  name: string;
  slug: string;
}

export interface UpdateSubSubCategoryRequest {
  subCategoryId?: string;
  name?: string;
  slug?: string;
}

export interface GetSubSubCategoriesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetSubSubCategoriesResponse {
  items: SubSubCategory[];
  total: number;
  page: number;
  pageSize: number;
}
