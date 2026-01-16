export const subSubCategoryRoute = {
  list: "/api/admin/sub-sub-categories",
  create: "/api/admin/sub-sub-categories",
  get: (id: string) => `/api/admin/sub-sub-categories/${id}`,
  update: (id: string) => `/api/admin/sub-sub-categories/${id}`,
  delete: (id: string) => `/api/admin/sub-sub-categories/${id}`,
  checkSlug: "/api/admin/sub-sub-categories/check-slug",
} as const;
