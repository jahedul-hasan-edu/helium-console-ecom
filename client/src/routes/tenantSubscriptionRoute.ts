export const api = {
  tenantSubscriptions: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/tenant-subscriptions',
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/tenant-subscriptions',
    },
    get: {
      method: 'GET' as const,
      path: (id: string) => `/api/admin/tenant-subscriptions/${id}`,
    },
    update: {
      method: 'PATCH' as const,
      path: (id: string) => `/api/admin/tenant-subscriptions/${id}`,
    },
    delete: {
      method: 'DELETE' as const,
      path: (id: string) => `/api/admin/tenant-subscriptions/${id}`,
    },
  },
};
