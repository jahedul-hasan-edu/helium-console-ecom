export const api = {
  products: {
    list: { method: 'GET', path: '/api/admin/products' },
    create: { method: 'POST', path: '/api/admin/products' },
    get: { method: 'GET', path: (id: string) => `/api/admin/products/${id}` },
    update: { method: 'PATCH', path: (id: string) => `/api/admin/products/${id}` },
    delete: { method: 'DELETE', path: (id: string) => `/api/admin/products/${id}` },
  },
};
