import { z } from "zod";
import { createPageSchema, pageResponseSchema, updatePageSchema } from "server/shared/dtos/Page";

export const api = {
  pages: {
    list: {
      method: "GET" as const,
      path: "/api/admin/pages",
      responses: {
        200: z.array(pageResponseSchema),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/admin/pages",
      input: createPageSchema,
      responses: {
        201: pageResponseSchema,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/admin/pages/:id",
      input: updatePageSchema,
      responses: {
        200: pageResponseSchema,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/admin/pages/:id",
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
  },
};