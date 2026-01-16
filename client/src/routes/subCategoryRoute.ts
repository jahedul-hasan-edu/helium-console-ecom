export const subCategoryRoute = {
  list: "/api/admin/sub-categories",
  create: "/api/admin/sub-categories",
  get: (id: string) => `/api/admin/sub-categories/${id}`,
  update: (id: string) => `/api/admin/sub-categories/${id}`,
  delete: (id: string) => `/api/admin/sub-categories/${id}`,
  checkSlug: "/api/admin/sub-categories/check-slug",
} as const;
