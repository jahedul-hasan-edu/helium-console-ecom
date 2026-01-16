export const api = {
  subCategories: {
    list: { method: 'GET', path: '/api/admin/sub-categories' },
    create: { method: 'POST', path: '/api/admin/sub-categories' },
    get: { method: 'GET', path: (id: string) => `/api/admin/sub-categories/${id}` },
    update: { method: 'PATCH', path: (id: string) => `/api/admin/sub-categories/${id}` },
    delete: { method: 'DELETE', path: (id: string) => `/api/admin/sub-categories/${id}` },
    checkSlug: { method: 'GET', path: (slug: string) => `/api/admin/sub-categories/check-slug?slug=${encodeURIComponent(slug)}` },
  },
};
