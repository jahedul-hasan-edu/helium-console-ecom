export const api = {
  pages: {
    list: {
      method: "GET" as const,
      path: "/api/admin/pages",
    },
    create: {
      method: "POST" as const,
      path: "/api/admin/pages",
    },
    update: {
      method: "PATCH" as const,
      path: (id: string) => `/api/admin/pages/${id}`,
    },
    delete: {
      method: "DELETE" as const,
      path: (id: string) => `/api/admin/pages/${id}`,
    },
  },
};