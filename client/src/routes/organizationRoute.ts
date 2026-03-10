export const api = {
  organizations: {
    list: {
      path: "/api/admin/organizations",
    },
    create: {
      path: "/api/admin/organizations",
    },
    get: (id: string) => ({
      path: `/api/admin/organizations/${id}`,
    }),
    update: (id: string) => ({
      path: `/api/admin/organizations/${id}`,
    }),
    delete: (id: string) => ({
      path: `/api/admin/organizations/${id}`,
    }),
  },
};