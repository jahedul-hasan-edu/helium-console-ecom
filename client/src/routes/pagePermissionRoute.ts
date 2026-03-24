export const api = {
  pagePermissions: {
    get: {
      method: "GET" as const,
      path: (roleId: string) => `/api/admin/page-permissions/${roleId}`,
    },
    update: {
      method: "PUT" as const,
      path: (roleId: string) => `/api/admin/page-permissions/${roleId}`,
    },
  },
};