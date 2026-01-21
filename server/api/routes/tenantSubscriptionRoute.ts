export const api = {
  tenantSubscriptions: {
    list: { method: 'GET', path: '/api/admin/tenant-subscriptions' },
    create: { method: 'POST', path: '/api/admin/tenant-subscriptions' },
    get: { method: 'GET', path: '/api/admin/tenant-subscriptions/:id' },
    update: { method: 'PATCH', path: '/api/admin/tenant-subscriptions/:id' },
    delete: { method: 'DELETE', path: '/api/admin/tenant-subscriptions/:id' },
  },
};
