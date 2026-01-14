/**
 * Pagination and sorting default values
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 10,
  SORT_ORDER: "desc" as const,
} as const;

/**
 * Default sort order type
 */
export type DefaultSortOrder = typeof PAGINATION_DEFAULTS.SORT_ORDER;
