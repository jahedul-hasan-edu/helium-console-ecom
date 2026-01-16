export const categoryRoute = {
  list: "/api/admin/categories",
  create: "/api/admin/categories",
  get: (id: string) => `/api/admin/categories/${id}`,
  update: (id: string) => `/api/admin/categories/${id}`,
  delete: (id: string) => `/api/admin/categories/${id}`,
  checkSlug: "/api/admin/categories/check-slug",
} as const;
