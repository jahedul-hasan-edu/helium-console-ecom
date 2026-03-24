import { z } from "zod";
import { createRoleSchema, roleResponseSchema, updateRoleSchema } from "server/shared/dtos/Role";

export const api = {
  roles: {
    list: {
      method: "GET" as const,
      path: "/api/admin/roles",
      responses: {
        200: z.array(roleResponseSchema),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/admin/roles",
      input: createRoleSchema,
      responses: {
        201: roleResponseSchema,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/admin/roles/:id",
      input: updateRoleSchema,
      responses: {
        200: roleResponseSchema,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/admin/roles/:id",
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
};