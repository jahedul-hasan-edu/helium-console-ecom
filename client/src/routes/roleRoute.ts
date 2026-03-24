export const api = {
  roles: {
    list: {
      method: "GET" as const,
      path: "/api/admin/roles",
    },
    create: {
      method: "POST" as const,
      path: "/api/admin/roles",
    },
    update: {
      method: "PATCH" as const,
      path: (id: string) => `/api/admin/roles/${id}`,
    },
    delete: {
      method: "DELETE" as const,
      path: (id: string) => `/api/admin/roles/${id}`,
    },
  },
};