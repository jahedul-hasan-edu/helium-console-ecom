import { createSubSubCategorySchema, updateSubSubCategorySchema, subSubCategoryResponseSchema } from 'server/shared/dtos/SubSubCategory';
import { errorSchemas } from 'server/shared/utils/errorSchemas';
import { z } from 'zod';

export const api = {
  subSubCategories: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/sub-sub-categories',
      responses: {
        200: z.array(subSubCategoryResponseSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/admin/sub-sub-categories',
      input: createSubSubCategorySchema,
      responses: {
        201: subSubCategoryResponseSchema,
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/admin/sub-sub-categories/:id',
      responses: {
        200: subSubCategoryResponseSchema,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/admin/sub-sub-categories/:id',
      input: updateSubSubCategorySchema,
      responses: {
        200: subSubCategoryResponseSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/admin/sub-sub-categories/:id',
      responses: {
        200: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
};
