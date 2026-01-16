export const api = {
  categories: {
    list: { method: 'GET', path: '/api/admin/categories' },
    create: { method: 'POST', path: '/api/admin/categories' },
    get: { method: 'GET', path: (id: string) => `/api/admin/categories/${id}` },
    update: { method: 'PATCH', path: (id: string) => `/api/admin/categories/${id}` },
    delete: { method: 'DELETE', path: (id: string) => `/api/admin/categories/${id}` },
    checkSlug: { method: 'GET', path: (slug: string) => `/api/admin/categories/check-slug?slug=${encodeURIComponent(slug)}` },
  },
};
