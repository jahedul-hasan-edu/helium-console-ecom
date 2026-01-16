import { createCategorySchema, updateCategorySchema, categoryResponseSchema } from 'server/shared/dtos/Category';
import { errorSchemas } from 'server/shared/utils/errorSchemas';
import { z } from 'zod';

export const api = {
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/categories',
      responses: {
        200: z.array(categoryResponseSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/categories',
      input: createCategorySchema,
      responses: {
        201: categoryResponseSchema,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/admin/categories/:id',
      responses: {
        200: categoryResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/admin/categories/:id',
      input: updateCategorySchema,
      responses: {
        200: categoryResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/categories/:id',
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
};
