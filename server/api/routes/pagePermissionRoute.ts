import { pagePermissionResponseSchema, updatePagePermissionsSchema } from "server/shared/dtos/PagePermission";

export const api = {
  pagePermissions: {
    get: {
      method: "GET" as const,
      path: "/api/admin/page-permissions/:roleId",
      responses: {
        200: pagePermissionResponseSchema,
      },
    },
    update: {
      method: "PUT" as const,
      path: "/api/admin/page-permissions/:roleId",
      input: updatePagePermissionsSchema,
      responses: {
        200: pagePermissionResponseSchema,
      },
    },
  },
};