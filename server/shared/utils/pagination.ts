/**
 * Generic pagination and sorting options interface
 * Can be used for any entity/model
 */
export interface PaginationOptions<T extends string = string> {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: T;
  sortOrder?: "asc" | "desc";
}

/**
 * Generic pagination response interface
 * Can be used for any entity/model
 */
export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
