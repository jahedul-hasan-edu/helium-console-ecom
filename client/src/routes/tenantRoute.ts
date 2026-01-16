
export const api = {
  tenants: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/tenants',
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/tenants',
    },
    get: {
      method: 'GET' as const,
      path: (id:string)=> `/api/admin/tenants/${id}`,
    },
    update: {
      method: 'PATCH' as const,
      path: (id:string)=> `/api/admin/tenants/${id}`,
    },
    delete: {
      method: 'DELETE' as const,
      path: (id:string)=> `/api/admin/tenants/${id}`,
    },
    checkDomain: {
      method: 'GET' as const,
      path: (domain: string) => `/api/admin/tenants/check-domain?domain=${encodeURIComponent(domain)}`,
    },
  },
};
