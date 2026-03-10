export const api = {
  orders: {
    list: {
      path: "/api/admin/orders",
    },
    create: {
      path: "/api/admin/orders",
    },
    get: (id: string) => ({
      path: `/api/admin/orders/${id}`,
    }),
    update: (id: string) => ({
      path: `/api/admin/orders/${id}`,
    }),
    delete: (id: string) => ({
      path: `/api/admin/orders/${id}`,
    }),
  },
};