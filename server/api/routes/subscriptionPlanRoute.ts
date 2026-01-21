import {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  subscriptionPlanResponseSchema,
} from "server/shared/dtos/SubscriptionPlan";
import { errorSchemas } from "server/shared/utils/errorSchemas";
import { z } from "zod";

export const api = {
  subscriptionPlans: {
    list: {
      method: "GET" as const,
      path: "/api/admin/subscriptionPlans",
      responses: {
        200: z.array(subscriptionPlanResponseSchema),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/admin/subscriptionPlans",
      input: createSubscriptionPlanSchema,
      responses: {
        201: subscriptionPlanResponseSchema,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/admin/subscriptionPlans/:id",
      responses: {
        200: subscriptionPlanResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/admin/subscriptionPlans/:id",
      input: updateSubscriptionPlanSchema,
      responses: {
        200: subscriptionPlanResponseSchema,
        404: errorSchemas.notFound,
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/admin/subscriptionPlans/:id",
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};
