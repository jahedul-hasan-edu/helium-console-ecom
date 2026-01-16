export interface MainCategory {
  id: string;
  tenantId: string | null;
  name: string | null;
  slug: string | null;
  orderIndex: number | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: Date | null;
  updatedOn: Date | null;
  userIp: string | null;
}

export interface CreateMainCategoryRequest {
  name: string;
  slug: string;
  orderIndex: number;
}

export interface UpdateMainCategoryRequest {
  name: string;
  slug: string;
  orderIndex: number;
}

export interface MainCategoryResponse extends MainCategory {}

export type MainCategoryListResponse = MainCategory[];
