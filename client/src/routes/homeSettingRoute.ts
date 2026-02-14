/**
 * Home Setting API Route definitions
 */

export const api = {
  homeSettings: {
    list: {
      path: "/api/admin/homeSettings",
    },
    create: {
      path: "/api/admin/homeSettings",
    },
    get: (id: string) => ({
      path: `/api/admin/homeSettings/${id}`,
    }),
    update: (id: string) => ({
      path: `/api/admin/homeSettings/${id}`,
    }),
    delete: (id: string) => ({
      path: `/api/admin/homeSettings/${id}`,
    }),
  },
};
