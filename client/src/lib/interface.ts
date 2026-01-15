import { SORT_ORDERS } from "./constants";

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: typeof SORT_ORDERS[keyof typeof SORT_ORDERS];
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}