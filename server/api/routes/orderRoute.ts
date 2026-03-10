import { z } from "zod";
import {
  createOrderSchema,
  orderResponseSchema,
  updateOrderSchema,
} from "server/shared/dtos/Order";
import { errorSchemas } from "server/shared/utils/errorSchemas";

export const api = {
  orders: {
    list: {
      method: "GET" as const,
      path: "/api/admin/orders",
      responses: {
        200: z.array(orderResponseSchema),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/admin/orders",
      input: createOrderSchema,
      responses: {
        201: orderResponseSchema,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/admin/orders/:id",
      responses: {
        200: orderResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/admin/orders/:id",
      input: updateOrderSchema,
      responses: {
        200: orderResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/admin/orders/:id",
      responses: {
        200: z.object({ message: z.string() }).optional(),
        404: errorSchemas.notFound,
      },
    },
  },
};