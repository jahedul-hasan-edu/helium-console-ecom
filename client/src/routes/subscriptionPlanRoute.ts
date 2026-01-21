
export const api = {
  subscriptionPlans: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/subscriptionPlans',
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/subscriptionPlans',
    },
    get: {
      method: 'GET' as const,
      path: (id: string) => `/api/admin/subscriptionPlans/${id}`,
    },
    update: {
      method: 'PATCH' as const,
      path: (id: string) => `/api/admin/subscriptionPlans/${id}`,
    },
    delete: {
      method: 'DELETE' as const,
      path: (id: string) => `/api/admin/subscriptionPlans/${id}`,
    },
  },
};
