export const api = {
  products: {
    list: { method: 'GET', path: '/api/admin/products' },
    create: { method: 'POST', path: '/api/admin/products' },
    get: { method: 'GET', path: '/api/admin/products/:id' },
    update: { method: 'PATCH', path: '/api/admin/products/:id' },
    delete: { method: 'DELETE', path: '/api/admin/products/:id' },
  },
};
