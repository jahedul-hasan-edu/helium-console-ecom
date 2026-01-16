import { createSubCategorySchema, updateSubCategorySchema, subCategoryResponseSchema } from 'server/shared/dtos/SubCategory';
import { errorSchemas } from 'server/shared/utils/errorSchemas';
import { z } from 'zod';

export const api = {
  subCategories: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/sub-categories',
      responses: {
        200: z.array(subCategoryResponseSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/sub-categories',
      input: createSubCategorySchema,
      responses: {
        201: subCategoryResponseSchema,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/admin/sub-categories/:id',
      responses: {
        200: subCategoryResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/admin/sub-categories/:id',
      input: updateSubCategorySchema,
      responses: {
        200: subCategoryResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/sub-categories/:id',
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
};
