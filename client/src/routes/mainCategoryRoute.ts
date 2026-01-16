
export const api = {
  mainCategories: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/main-categories',
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/main-categories',
    },
    get: {
      method: 'GET' as const,
      path: (id:string)=> `/api/admin/main-categories/${id}`,
    },
    update: {
      method: 'PATCH' as const,
      path: (id:string)=> `/api/admin/main-categories/${id}`,
    },
    delete: {
      method: 'DELETE' as const,
      path: (id:string)=> `/api/admin/main-categories/${id}`,
    },
    checkSlug: {
      method: 'GET' as const,
      path: (slug: string) => `/api/admin/main-categories/check-slug?slug=${encodeURIComponent(slug)}`,
    },
  },
};
