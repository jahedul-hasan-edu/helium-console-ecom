import { z } from "zod";
import {
  createOrganizationSchema,
  organizationResponseSchema,
  updateOrganizationSchema,
} from "server/shared/dtos/Organization";
import { errorSchemas } from "server/shared/utils/errorSchemas";

export const api = {
  organizations: {
    list: {
      method: "GET" as const,
      path: "/api/admin/organizations",
      responses: {
        200: z.array(organizationResponseSchema),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/admin/organizations",
      input: createOrganizationSchema,
      responses: {
        201: organizationResponseSchema,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/admin/organizations/:id",
      responses: {
        200: organizationResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/admin/organizations/:id",
      input: updateOrganizationSchema,
      responses: {
        200: organizationResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/admin/organizations/:id",
      responses: {
        200: z.object({ message: z.string() }).optional(),
        404: errorSchemas.notFound,
      },
    },
  },
};