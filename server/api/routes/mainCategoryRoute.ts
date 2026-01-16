import { createMainCategorySchema, updateMainCategorySchema, mainCategoryResponseSchema } from 'server/shared/dtos/MainCategory';
import { errorSchemas } from 'server/shared/utils/errorSchemas';
import { z } from 'zod';

export const api = {
  mainCategories: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/main-categories',
      responses: {
        200: z.array(mainCategoryResponseSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/main-categories',
      input: createMainCategorySchema,
      responses: {
        201: mainCategoryResponseSchema,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/admin/main-categories/:id',
      responses: {
        200: mainCategoryResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/admin/main-categories/:id',
      input: updateMainCategorySchema,
      responses: {
        200: mainCategoryResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/main-categories/:id',
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
};
