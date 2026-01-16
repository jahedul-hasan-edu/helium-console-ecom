/**
 * Product model interfaces
 */

export interface Product {
  id: string;
  tenantId: string | null;
  subCategoryId: string | null;
  subSubCategoryId: string | null;
  name: string | null;
  description: string | null;
  price: string | null;
  stock: number | null;
  isActive: boolean | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdOn: string | null;
  updatedOn: string | null;
  userIp: string | null;
}

export interface CreateProductRequest {
  subCategoryId: string;
  subSubCategoryId: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  isActive: boolean;
}

export interface UpdateProductRequest {
  subCategoryId?: string;
  subSubCategoryId?: string;
  name?: string;
  description?: string;
  price?: string;
  stock?: number;
  isActive?: boolean;
}

export interface GetProductsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetProductsResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
