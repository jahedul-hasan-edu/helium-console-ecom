export const api = {
  faqs: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/faqs',
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/faqs',
    },
    get: (id: string) => ({
      method: 'GET' as const,
      path: `/api/admin/faqs/${id}`,
    }),
    update: (id: string) => ({
      method: 'PATCH' as const,
      path: `/api/admin/faqs/${id}`,
    }),
    delete: (id: string) => ({
      method: 'DELETE' as const,
      path: `/api/admin/faqs/${id}`,
    }),
  },
};
